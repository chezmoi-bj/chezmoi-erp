import React, { useState } from 'react';
import { Header } from './components/Header';
import { ArcheDashboard } from './components/ArcheDashboard';
import { CensusForm } from './components/CensusForm';
import { SyncInspector } from './components/SyncInspector';
import { EMecefModule } from './components/EMecefModule';
import { HRAndAgents } from './components/HRAndAgents';
import { GEDModule } from './components/GEDModule';
import { CodeExplorer } from './components/CodeExplorer';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { 
  INITIAL_USERS,
  INITIAL_DOCUMENTS, 
  INITIAL_PROPERTIES, 
  INITIAL_TRANSACTIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYSLIPS
} from './data/mockData';
import { 
  UserAccount, 
  CashTransaction, 
  LegalDocument, 
  PropertyRecord,
  LeaveRequest,
  PayslipRecord
} from './types';
import { 
  enqueueMutation, 
  resolveConflictLWW, 
  SyncQueueItem, 
  updateQueueItemStatus 
} from './utils/sync_engine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [currency, setCurrency] = useState<'FCFA' | 'USD'>('FCFA');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(null);

  // Users & RBAC state
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]); // Defaults to Super Admin

  // Entities state
  const [properties, setProperties] = useState<PropertyRecord[]>(INITIAL_PROPERTIES);
  const [transactions, setTransactions] = useState<CashTransaction[]>(INITIAL_TRANSACTIONS);
  const [documents, setDocuments] = useState<LegalDocument[]>(INITIAL_DOCUMENTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payslips, setPayslips] = useState<PayslipRecord[]>(INITIAL_PAYSLIPS);

  // Initial Sync Queue
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([
    {
      id: 'sync_initial_01',
      entityType: 'property',
      entityId: 'prop_04',
      action: 'create',
      payload: INITIAL_PROPERTIES[3],
      localTimestamp: Date.now() - 3600000 * 2,
      syncStatus: 'pending',
      retryCount: 0,
      maxRetries: 5,
    },
  ]);

  // Toggle online / offline
  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      setTimeout(() => {
        triggerSyncProcess();
      }, 600);
    }
  };

  // Trigger sync process
  const triggerSyncProcess = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      setSyncQueue((prev) =>
        prev.map((item) => ({
          ...item,
          syncStatus: 'synced',
          serverTimestamp: Date.now(),
        }))
      );

      setProperties((prev) =>
        prev.map((p) => ({
          ...p,
          syncStatus: 'synced',
          serverSyncTimestamp: Date.now(),
        }))
      );

      setIsSyncing(false);
    }, 1200);
  };

  // Save new census record
  const handleSavePropertyRecord = (newProp: PropertyRecord) => {
    setProperties([newProp, ...properties]);

    const { updatedQueue } = enqueueMutation(
      syncQueue,
      'property',
      newProp.id,
      'create',
      newProp
    );

    if (!isOnline) {
      setSyncQueue(updatedQueue);
    } else {
      const synced = updateQueueItemStatus(updatedQueue, updatedQueue[0].id, 'synced', {
        serverTimestamp: Date.now(),
      });
      setSyncQueue(synced);
    }

    setActiveTab('dashboard');
  };

  // Add & update user account
  const handleAddUser = (newUser: UserAccount) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // Add transaction
  const handleAddTransaction = (newTx: CashTransaction) => {
    setTransactions([newTx, ...transactions]);
  };

  // Add document
  const handleAddDocument = (newDoc: LegalDocument) => {
    setDocuments([newDoc, ...documents]);
  };

  // Leave management
  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaveRequests([req, ...leaveRequests]);
  };

  const handleUpdateLeaveStatus = (id: string, status: 'APPROUVE' | 'REJETE') => {
    setLeaveRequests(leaveRequests.map(l => l.id === id ? { ...l, status, approvedBy: currentUser.name } : l));
  };

  // Payslip generation
  const handleGeneratePayslip = (slip: PayslipRecord) => {
    setPayslips([slip, ...payslips]);
    // Also record as company expense
    const salaryExpense: CashTransaction = {
      id: `tx_sal_${Date.now()}`,
      code: `DEP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: 'SORTIE',
      category: 'SALAIRE_REMUNERATION',
      amount: slip.netPayable,
      description: `Rémunération nette ${slip.month} - ${slip.employeeName}`,
      agentOrClient: slip.employeeName,
      paymentMode: 'VIREMENT',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      emecefInvoiceRef: slip.slipNumber,
      beneficiaryEmployeeId: slip.employeeId,
    };
    setTransactions([salaryExpense, ...transactions]);
  };

  // Clear synced queue items
  const handleClearSyncedQueue = () => {
    setSyncQueue(syncQueue.filter((item) => item.syncStatus !== 'synced'));
  };

  // Simulate concurrent conflict
  const handleSimulateConflict = () => {
    const targetProp = properties[0];
    const localVersion = { ...targetProp, priceAmount: targetProp.priceAmount + 10000000, updatedAt: Date.now() };
    const serverVersion = { ...targetProp, priceAmount: targetProp.priceAmount - 5000000, updatedAt: Date.now() - 60000 };

    const resolution = resolveConflictLWW(
      localVersion,
      serverVersion,
      localVersion.updatedAt,
      serverVersion.updatedAt
    );

    const conflictItem: SyncQueueItem = {
      id: `sync_conflict_${Date.now()}`,
      entityType: 'property',
      entityId: targetProp.id,
      action: 'update',
      payload: {
        resolutionStrategy: resolution.strategy,
        resolvedPrice: resolution.resolved.priceAmount,
        note: 'Conflit arbitré par horodatage Last-Write-Wins (Client local plus récent)',
      },
      localTimestamp: Date.now(),
      syncStatus: 'conflict',
      retryCount: 1,
      maxRetries: 5,
      lastError: 'HTTP 409 Conflict: Concurrent modification detected on Hostinger Cloud.',
    };

    setSyncQueue([conflictItem, ...syncQueue]);
    alert(
      `Conflit simulé avec succès ! Stratégie retenue : "${resolution.strategy}". Prix résolu : ${resolution.resolved.priceAmount.toLocaleString()} FCFA.`
    );
  };

  const pendingCount = syncQueue.filter((i) => i.syncStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        toggleNetwork={toggleNetwork}
        pendingSyncCount={pendingCount}
        triggerSync={triggerSyncProcess}
        isSyncing={isSyncing}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openSettings={() => setSettingsOpen(true)}
        openLoginModal={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 w-full">
        {viewMode === 'mobile' ? (
          /* Responsive Mobile Frame with widened container to prevent cramped layouts */
          <div className="max-w-xl sm:max-w-2xl w-full mx-auto my-3 bg-slate-950 p-3 sm:p-5 rounded-[44px] shadow-2xl ring-8 ring-slate-800/80 border-4 border-slate-700">
            {/* Phone notch */}
            <div className="w-36 h-4 bg-black rounded-b-xl mx-auto mb-3 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* Inner screen: full width container on mobile */}
            <div className="bg-[#F8FAFC] rounded-[32px] overflow-hidden min-h-[740px] max-h-[880px] overflow-y-auto p-3 sm:p-5 text-slate-800 w-full">
              {activeTab === 'dashboard' && (
                <ArcheDashboard
                  properties={properties}
                  agents={users}
                  onSelectProperty={setSelectedProperty}
                  onOpenCensus={() => setActiveTab('census')}
                  currency={currency}
                  setCurrency={setCurrency}
                />
              )}
              {activeTab === 'census' && (
                <CensusForm
                  onSaveRecord={handleSavePropertyRecord}
                  isOnline={isOnline}
                  assignedAgentName={currentUser.name}
                  assignedAgentId={currentUser.id}
                />
              )}
              {activeTab === 'sync' && (
                <SyncInspector
                  queue={syncQueue}
                  isOnline={isOnline}
                  toggleNetwork={toggleNetwork}
                  triggerSync={triggerSyncProcess}
                  isSyncing={isSyncing}
                  onClearSynced={handleClearSyncedQueue}
                  onSimulateConflict={handleSimulateConflict}
                />
              )}
              {activeTab === 'accounting' && (
                <EMecefModule
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  currency={currency}
                  employees={users}
                />
              )}
              {activeTab === 'hr' && (
                <HRAndAgents
                  agents={users}
                  onAddAgent={handleAddUser}
                  onUpdateAgent={handleUpdateUser}
                  onSelectUser={setCurrentUser}
                  currency={currency}
                  leaveRequests={leaveRequests}
                  onAddLeaveRequest={handleAddLeaveRequest}
                  onUpdateLeaveStatus={handleUpdateLeaveStatus}
                  payslips={payslips}
                  onGeneratePayslip={handleGeneratePayslip}
                />
              )}
              {activeTab === 'ged' && (
                <GEDModule
                  documents={documents}
                  onUploadDoc={handleAddDocument}
                />
              )}
              {activeTab === 'code' && <CodeExplorer />}
            </div>

            {/* Phone bottom indicator bar */}
            <div className="w-32 h-1.5 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        ) : (
          /* Standard Desktop View */
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <ArcheDashboard
                properties={properties}
                agents={users}
                onSelectProperty={setSelectedProperty}
                onOpenCensus={() => setActiveTab('census')}
                currency={currency}
                setCurrency={setCurrency}
              />
            )}
            {activeTab === 'census' && (
              <CensusForm
                onSaveRecord={handleSavePropertyRecord}
                isOnline={isOnline}
                assignedAgentName={currentUser.name}
                assignedAgentId={currentUser.id}
              />
            )}
            {activeTab === 'sync' && (
              <SyncInspector
                queue={syncQueue}
                isOnline={isOnline}
                toggleNetwork={toggleNetwork}
                triggerSync={triggerSyncProcess}
                isSyncing={isSyncing}
                onClearSynced={handleClearSyncedQueue}
                onSimulateConflict={handleSimulateConflict}
              />
            )}
            {activeTab === 'accounting' && (
              <EMecefModule
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                currency={currency}
                employees={users}
              />
            )}
            {activeTab === 'hr' && (
              <HRAndAgents
                agents={users}
                onAddAgent={handleAddUser}
                onUpdateAgent={handleUpdateUser}
                onSelectUser={setCurrentUser}
                currency={currency}
                leaveRequests={leaveRequests}
                onAddLeaveRequest={handleAddLeaveRequest}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                payslips={payslips}
                onGeneratePayslip={handleGeneratePayslip}
              />
            )}
            {activeTab === 'ged' && (
              <GEDModule
                documents={documents}
                onUploadDoc={handleAddDocument}
              />
            )}
            {activeTab === 'code' && <CodeExplorer />}
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        currency={currency}
      />

      {/* Settings Modal (WhatsApp, Gmail, Docs, WordPress, Gemini, e-MECeF, Maps) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Login & Account Switcher / Editor Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={setCurrentUser}
        onUpdateUser={handleUpdateUser}
      />

    </div>
  );
}
