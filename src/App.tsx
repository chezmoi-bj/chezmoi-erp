import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArcheDashboard } from './components/ArcheDashboard';
import { CensusForm } from './components/CensusForm';
import { EMecefModule } from './components/EMecefModule';
import { HRAndAgents } from './components/HRAndAgents';
import { GEDModule } from './components/GEDModule';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { UserProfileModal } from './components/UserProfileModal';
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
  PayslipRecord,
  AuthSession
} from './types';
import { 
  enqueueMutation, 
  resolveConflictLWW, 
  SyncQueueItem, 
  updateQueueItemStatus 
} from './utils/sync_engine';
import { 
  loadSession, 
  saveSession, 
  clearSession, 
  isRoleAuthorizedForTab, 
  getDefaultTabForRole,
  ROLE_DEFINITIONS 
} from './utils/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  // Session & Authentification OTP persistante
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = loadSession();
    return saved ? saved.user : INITIAL_USERS[0];
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Onglet actif initialisé selon le rôle
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = loadSession();
    return saved ? getDefaultTabForRole(saved.user.role) : 'dashboard';
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [currency, setCurrency] = useState<'FCFA' | 'USD'>('FCFA');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(null);

  // Utilisateurs & comptes
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Données métier
  const [properties, setProperties] = useState<PropertyRecord[]>(INITIAL_PROPERTIES);
  const [transactions, setTransactions] = useState<CashTransaction[]>(INITIAL_TRANSACTIONS);
  const [documents, setDocuments] = useState<LegalDocument[]>(INITIAL_DOCUMENTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payslips, setPayslips] = useState<PayslipRecord[]>(INITIAL_PAYSLIPS);

  // File de synchronisation Drift SQLite locale
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Chargement des données fraîches depuis le backend (MySQL / Mémoire)
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(() => {});

    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProperties(data);
        }
      })
      .catch(() => {});
  }, []);

  // Synchronisation du rôle lors du chargement ou changement de session
  useEffect(() => {
    if (session) {
      const allowed = isRoleAuthorizedForTab(currentUser.role, activeTab);
      if (!allowed) {
        setActiveTab(getDefaultTabForRole(currentUser.role));
      }
    }
  }, [session, currentUser.role]);

  // Connexion réussie via Code OTP
  const handleLoginSuccess = (user: UserAccount, token: string) => {
    saveSession(user, token);
    setSession({
      token,
      user,
      expiresAt: Date.now() + 86400 * 7 * 1000,
    });
    setCurrentUser(user);
    setActiveTab(getDefaultTabForRole(user.role));
  };

  // Déconnexion propre
  const handleLogout = () => {
    clearSession();
    setSession(null);
    setIsProfileModalOpen(false);
  };

  // Toggle réseau simulateur
  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      setTimeout(() => {
        triggerSyncProcess();
      }, 600);
    }
  };

  // Synchronisation vers MySQL Hostinger
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

  // Sauvegarde recensement foncier
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

    // Si le rôle permet le tableau de bord, y rediriger, sinon rester sur recensement
    if (isRoleAuthorizedForTab(currentUser.role, 'dashboard')) {
      setActiveTab('dashboard');
    }
  };

  // Gestion des utilisateurs et rôles
  const handleAddUser = async (newUser: UserAccount) => {
    const isCentralAdmin = newUser.email.toLowerCase() === 'chezmoi.benin@gmail.com';
    const pendingUser: UserAccount = {
      ...newUser,
      status: isCentralAdmin ? 'ACTIF' : 'EN_ATTENTE_VALIDATION',
      emailVerified: isCentralAdmin,
    };
    setUsers((prev) => [...prev, pendingUser]);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingUser)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUsers((prev) => prev.map(u => u.id === data.user.id ? data.user : u));
        }
      }
    } catch (err) {
      console.error('Erreur synchronisation nouvel utilisateur:', err);
    }
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      if (session) {
        saveSession(updatedUser, session.token);
      }
    }
  };

  // Comptabilité & Transactions
  const handleAddTransaction = (newTx: CashTransaction) => {
    setTransactions([newTx, ...transactions]);
  };

  // GED Foncière
  const handleAddDocument = (newDoc: LegalDocument) => {
    setDocuments([newDoc, ...documents]);
  };

  // Congés RH
  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaveRequests([req, ...leaveRequests]);
  };

  const handleUpdateLeaveStatus = (id: string, status: 'APPROUVE' | 'REJETE') => {
    setLeaveRequests(leaveRequests.map(l => l.id === id ? { ...l, status, approvedBy: currentUser.name } : l));
  };

  // Fiches de paie RH
  const handleGeneratePayslip = (slip: PayslipRecord) => {
    setPayslips([slip, ...payslips]);
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

  const pendingCount = syncQueue.filter((i) => i.syncStatus === 'pending').length;

  // 1. Si aucune session active n'existe, afficher la page d'authentification complète
  if (!session) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
      />
    );
  }

  // Vérification de sécurité RBAC pour le module actif
  const isAuthorized = isRoleAuthorizedForTab(currentUser.role, activeTab);
  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  // Rendu du contenu selon l'onglet autorisé
  const renderActiveTabContent = () => {
    if (!isAuthorized) {
      return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-[#FA3055] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-[#FA3055] uppercase tracking-wider">
            Sécurité & Contrôle d'accès
          </span>
          <h3 className="font-extrabold text-slate-900 text-xl mt-1 mb-2">
            Module non autorisé pour votre profil
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Votre compte est configuré avec le rôle <strong>{roleInfo.label}</strong>. Ce module est réservé aux départements accrédités.
          </p>
          <button
            onClick={() => setActiveTab(getDefaultTabForRole(currentUser.role))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FA3055] hover:bg-[#E01E42] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Revenir à mon espace de travail</span>
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ArcheDashboard
            properties={properties}
            agents={users}
            onSelectProperty={setSelectedProperty}
            onOpenCensus={() => setActiveTab('census')}
            currency={currency}
            setCurrency={setCurrency}
          />
        );
      case 'census':
        return (
          <CensusForm
            onSaveRecord={handleSavePropertyRecord}
            isOnline={isOnline}
            assignedAgentName={currentUser.name}
            assignedAgentId={currentUser.id}
          />
        );
      case 'accounting':
        return (
          <EMecefModule
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            currency={currency}
            employees={users}
          />
        );
      case 'hr':
        return (
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
        );
      case 'ged':
        return (
          <GEDModule
            documents={documents}
            onUploadDoc={handleAddDocument}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* Top Application Header - Cleaned & Perfectly Aligned */}
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
        openProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Content Area - Aligned exactly with max-w-7xl mx-auto */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 w-full">
        {viewMode === 'mobile' ? (
          /* Responsive Mobile Frame */
          <div className="max-w-xl sm:max-w-2xl w-full mx-auto my-3 bg-slate-950 p-3 sm:p-5 rounded-[44px] shadow-2xl ring-8 ring-slate-800/80 border-4 border-slate-700">
            {/* Phone notch */}
            <div className="w-36 h-4 bg-black rounded-b-xl mx-auto mb-3 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* Inner screen */}
            <div className="bg-[#F8FAFC] rounded-[32px] overflow-hidden min-h-[740px] max-h-[880px] overflow-y-auto p-3 sm:p-5 text-slate-800 w-full">
              {renderActiveTabContent()}
            </div>

            {/* Phone bottom indicator bar */}
            <div className="w-32 h-1.5 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        ) : (
          /* Standard Desktop View - Pristine alignment */
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveTabContent()}
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

      {/* User Account & 2FA Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />

    </div>
  );
}
