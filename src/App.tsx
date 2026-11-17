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
  AuthSession,
  PropertyOperationalStatus
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
  ROLE_DEFINITIONS,
  canAccessSystemSettings 
} from './utils/auth';
import { apiFetch } from './utils/api';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  CreditCard, 
  Users, 
  Layers, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronRight,
  X
} from 'lucide-react';

export default function App() {
  // Session & Authentification OTP persistante
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = loadSession();
    return saved ? saved.user : INITIAL_USERS[0];
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Theme global persistant (Sombre / Clair)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('chezmoi_theme') as 'dark' | 'light') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('chezmoi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  // Chargement des données fraîches depuis le backend (MySQL / Mémoire) via apiFetch résilient
  useEffect(() => {
    apiFetch('/api/users')
      .then((res) => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setUsers(res.data);
        }
      })
      .catch(() => {});

    apiFetch('/api/properties')
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) {
          setProperties(res.data);
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
    setMobileDrawerOpen(false);
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

    if (isRoleAuthorizedForTab(currentUser.role, 'dashboard')) {
      setActiveTab('dashboard');
    }
  };

  // Mise à jour de fiche de bien
  const handleUpdateProperty = async (updated: PropertyRecord) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProperty?.id === updated.id) {
      setSelectedProperty(updated);
    }

    if (isOnline) {
      try {
        await apiFetch(`/api/properties/${updated.id}`, {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.error('Erreur synchronisation mise à jour bien:', err);
      }
    }
  };

  // Modification dynamique du statut opérationnel (Disponible / En location / Vendu)
  const handleUpdatePropertyStatus = async (propertyId: string, newStatus: PropertyOperationalStatus) => {
    const now = Date.now();
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, operationalStatus: newStatus, updatedAt: now } : p))
    );
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty((prev) =>
        prev ? { ...prev, operationalStatus: newStatus, updatedAt: now } : null
      );
    }

    if (isOnline) {
      try {
        await apiFetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          body: JSON.stringify({ operationalStatus: newStatus }),
        });
      } catch (err) {
        console.error('Erreur mise à jour statut bien:', err);
      }
    }
  };

  // Suppression d'un bien avec confirmation et synchronisation BD temps réel
  const handleDeleteProperty = async (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }

    if (isOnline) {
      try {
        await apiFetch(`/api/properties/${propertyId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Erreur suppression bien:', err);
      }
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
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(pendingUser)
      });
      if (res.ok && res.user) {
        setUsers((prev) => prev.map(u => u.id === res.user.id ? res.user : u));
      }
    } catch (err) {
      console.error('Erreur synchronisation nouvel utilisateur:', err);
    }
  };

  const handleUpdateUser = async (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      if (session) {
        saveSession(updatedUser, session.token);
      }
    }
    try {
      await apiFetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUser),
      });
    } catch (err) {
      console.error('Erreur synchronisation mise à jour collaborateur:', err);
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
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Vérification de sécurité RBAC pour le module actif
  const isAuthorized = isRoleAuthorizedForTab(currentUser.role, activeTab);
  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  const mainNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Building2 },
    { id: 'census', label: 'Recensement terrain', icon: MapPin },
  ].filter((item) => isRoleAuthorizedForTab(currentUser.role, item.id));

  const managementNavItems = [
    { id: 'accounting', label: 'Facturation (e-MECeF)', icon: CreditCard },
    { id: 'hr', label: 'Agents & RH', icon: Users },
    { id: 'ged', label: 'GED foncière', icon: Layers },
  ].filter((item) => isRoleAuthorizedForTab(currentUser.role, item.id));

  const tabMeta: Record<string, { title: string; breadcrumb: string }> = {
    dashboard: { title: 'Tableau de bord', breadcrumb: 'Portefeuille immobilier' },
    census: { title: 'Recensement terrain', breadcrumb: 'Nouvelle fiche foncière' },
    accounting: { title: 'Facturation & Dépenses', breadcrumb: 'Norme e-MECeF DGI' },
    hr: { title: 'Agents & RH', breadcrumb: 'Personnel & paie' },
    ged: { title: 'GED foncière', breadcrumb: 'Archives certifiées' },
  };
  const currentMeta = tabMeta[activeTab] || { title: 'Tableau de bord', breadcrumb: 'Administration' };

  const renderSidebarLinks = (onAfterSelect?: () => void) => (
    <div className="space-y-6">
      {mainNavItems.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Principal
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onAfterSelect?.();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40 font-bold shadow-2xs'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {managementNavItems.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Gestion
          </p>
          <div className="space-y-1">
            {managementNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onAfterSelect?.();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40 font-bold shadow-2xs'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Compte
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(true);
              onAfterSelect?.();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white opacity-85 hover:opacity-100 transition-all cursor-pointer"
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">Mon Profil & 2FA</span>
          </button>

          {canAccessSystemSettings(currentUser.role) && (
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(true);
                onAfterSelect?.();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white opacity-85 hover:opacity-100 transition-all cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">Paramètres API</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white opacity-85 hover:opacity-100 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu du contenu selon l'onglet autorisé
  const renderActiveTabContent = () => {
    if (!isAuthorized) {
      return (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-neutral-200 text-center max-w-lg mx-auto my-12">
          <div className="w-14 h-14 bg-neutral-100 text-[#141414] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#141414] text-xl mb-2">
            Module non autorisé pour votre profil
          </h3>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Votre compte est configuré avec le rôle <strong>{roleInfo.label}</strong>. Ce module est réservé aux départements accrédités.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab(getDefaultTabForRole(currentUser.role))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
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
            currentUser={currentUser}
            onDeleteProperty={handleDeleteProperty}
            onUpdatePropertyStatus={handleUpdatePropertyStatus}
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
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'dark bg-[#0B0D10] text-neutral-100' : 'bg-[#FAFAFA] text-[#141414]'
    }`}>
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
        openProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenMobileMenu={() => setMobileDrawerOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] bg-[#F7F7F8] dark:bg-[#111419] border-r border-neutral-200 dark:border-white/10 h-full p-5 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-200 dark:border-white/10">
              <span className="font-extrabold text-sm text-[#141414] dark:text-white">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarLinks(() => setMobileDrawerOpen(false))}
          </aside>
        </div>
      )}

      {/* Workspace Body: Left Sidebar + Right Main Canvas (Listeo Dashboard Shell) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {viewMode === 'desktop' && (
          <aside className="hidden lg:block w-60 shrink-0 border-r border-neutral-200 dark:border-white/10 bg-[#F7F7F8] dark:bg-[#101318] px-4 py-6">
            <div className="sticky top-20">
              {renderSidebarLinks()}
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6">
          {viewMode === 'mobile' ? (
            /* Responsive Mobile Preview Frame */
            <div className="max-w-xl sm:max-w-2xl w-full mx-auto my-2 bg-neutral-950 p-3 sm:p-5 rounded-[44px] shadow-2xl ring-4 ring-neutral-800 border-2 border-neutral-700">
              <div className="w-36 h-4 bg-black rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-12 h-1.5 bg-neutral-800 rounded-full" />
              </div>
              <div className={`${theme === 'dark' ? 'bg-[#0B0D10] text-neutral-100' : 'bg-[#FAFAFA] text-[#141414]'} rounded-[32px] overflow-hidden min-h-[740px] max-h-[880px] overflow-y-auto p-3 sm:p-5 w-full`}>
                {renderActiveTabContent()}
              </div>
              <div className="w-32 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full space-y-5">
              {/* Listeo Breadcrumb + Page Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141414] dark:text-white">
                  {currentMeta.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <span>Accueil</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-[#141414] dark:text-white font-semibold">{currentMeta.breadcrumb}</span>
                </div>
              </div>

              {renderActiveTabContent()}
            </div>
          )}
        </main>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        currency={currency}
        currentUser={currentUser}
        onUpdateProperty={handleUpdateProperty}
        onDeleteProperty={handleDeleteProperty}
        onUpdatePropertyStatus={handleUpdatePropertyStatus}
      />

      {/* Settings Modal */}
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
