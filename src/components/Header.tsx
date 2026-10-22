import React from 'react';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Settings as SettingsIcon, 
  MapPin, 
  Users, 
  CreditCard, 
  Layers,
  UserCheck,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { ChezmoiLogo } from './ChezmoiLogo';
import { UserAccount } from '../types';
import { getAllowedTabsForRole, ROLE_DEFINITIONS } from '../utils/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  toggleNetwork: () => void;
  pendingSyncCount: number;
  triggerSync: () => void;
  isSyncing: boolean;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
  openSettings: () => void;
  openProfileModal: () => void;
  onLogout: () => void;
  currentUser: UserAccount;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  toggleNetwork,
  pendingSyncCount,
  triggerSync,
  isSyncing,
  viewMode,
  setViewMode,
  openSettings,
  openProfileModal,
  onLogout,
  currentUser,
}) => {
  // Liste nettoyée des onglets principaux (Sans sync ni code)
  const allTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Building2 },
    { id: 'census', label: 'Recensement terrain', icon: MapPin },
    { id: 'accounting', label: 'Facturation & dépenses (e-MECeF)', icon: CreditCard },
    { id: 'hr', label: 'Agents & RH', icon: Users },
    { id: 'ged', label: 'GED foncière', icon: Layers },
  ];

  // Filtrage selon la matrice RBAC du rôle de l'utilisateur
  const allowedTabIds = getAllowedTabsForRole(currentUser.role);
  const tabs = allTabs.filter(t => allowedTabIds.includes(t.id));

  const roleInfo = ROLE_DEFINITIONS[currentUser.role];
  const canAccessSettings = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Official Chezmoi Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <ChezmoiLogo size={38} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">chezmoi</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FA3055] text-white font-black tracking-wider">
                .bj ERP
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
              Multilocal offline-first (Hostinger MySQL)
            </p>
          </div>
        </div>

        {/* Center Navigation Pills (Desktop) - Strictly filtered by role */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-full border border-slate-200/80 shadow-2xs" aria-label="Navigation principale">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FA3055] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#FA3055] hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* Network Simulator Toggle */}
          <button
            onClick={toggleNetwork}
            title={isOnline ? 'Cliquer pour simuler le mode hors-ligne' : 'Cliquer pour réactiver la connexion Internet'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse hover:bg-rose-100'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">MySQL En Ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Hors-ligne</span>
              </>
            )}
          </button>

          {/* Quick Manual Sync Button */}
          <button
            onClick={triggerSync}
            disabled={!isOnline || isSyncing}
            title="Synchroniser le cache local SQLite (Drift) vers Hostinger MySQL"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSyncing
                ? 'bg-amber-50 text-amber-700 border-amber-300 cursor-wait'
                : !isOnline
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#FA3055]/30 hover:bg-[#F4F6F5] cursor-pointer shadow-2xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-[#FA3055]'}`} />
            <span className="hidden xl:inline">{isSyncing ? 'Sync...' : 'Sync'}</span>
          </button>

          {/* Viewport Frame Toggle */}
          <div className="hidden sm:flex items-center bg-[#F4F6F5] p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('desktop')}
              title="Vue écran PC"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'desktop' ? 'bg-white text-[#FA3055] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              title="Vue mobile agent terrain"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'mobile' ? 'bg-white text-[#FA3055] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings modal trigger (Accessible to Super Admin & Ops) */}
          {canAccessSettings && (
            <button
              onClick={openSettings}
              title="Paramètres API (WhatsApp, Gmail, Docs, WordPress, Gemini, e-MECeF)"
              className="p-1.5 rounded-full text-slate-600 hover:text-[#FA3055] hover:bg-[#F4F6F5] cursor-pointer transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Authenticated User Profile Button */}
          <button
            onClick={openProfileModal}
            title="Consulter le profil & paramétrer la double authentification (2FA)"
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 bg-white"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#FA3055]/30 flex-shrink-0"
              />
              {currentUser.twoFactorEnabled && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="2FA Activée" />
              )}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</p>
              <p className="text-[10px] text-[#FA3055] font-semibold">{roleInfo.label}</p>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Direct Logout Icon Button */}
          <button
            onClick={onLogout}
            title="Se déconnecter de la session"
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Mobile sub-navigation bar - Strictly inside max-w-7xl with equal horizontal alignment */}
      <div className="lg:hidden max-w-7xl mx-auto pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isActive ? 'bg-[#FA3055] text-white shadow-xs' : 'bg-[#F4F6F5] text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
