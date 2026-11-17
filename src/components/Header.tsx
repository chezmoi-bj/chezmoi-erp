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
  LogOut,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  User
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  toggleNetwork,
  triggerSync,
  isSyncing,
  viewMode,
  setViewMode,
  openSettings,
  openProfileModal,
  onLogout,
  currentUser,
  theme = 'light',
  onToggleTheme,
  onOpenMobileMenu,
}) => {
  const allTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Building2 },
    { id: 'census', label: 'Recensement', icon: MapPin },
    { id: 'accounting', label: 'e-MECeF', icon: CreditCard },
    { id: 'hr', label: 'Agents & RH', icon: Users },
    { id: 'ged', label: 'GED foncière', icon: Layers },
  ];

  const allowedTabIds = getAllowedTabsForRole(currentUser.role);
  const tabs = allTabs.filter((t) => allowedTabIds.includes(t.id));
  const roleInfo = ROLE_DEFINITIONS[currentUser.role];
  const canAccessSettings = currentUser.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#13161B]/95 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 px-2.5 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Mobile drawer trigger + Chezmoi Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              title="Ouvrir le menu"
              aria-label="Ouvrir le menu"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => allowedTabIds.includes('dashboard') && setActiveTab('dashboard')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer"
          >
            <ChezmoiLogo size={26} className="sm:w-9 sm:h-9 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#141414] dark:text-white tracking-tight text-sm sm:text-lg whitespace-nowrap">
                chezmoi
              </span>
              {/* Masqué sur mobile (< sm) pour garantir l'affichage complet à droite sans scroll */}
              <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-white/10 whitespace-nowrap">
                administration
              </span>
            </div>
          </div>
        </div>

        {/* Center Quick Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1.5" aria-label="Navigation rapide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40 font-bold'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls — Optimisés pour tenir dans 360-390px mobile sans défilement horizontal */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Network Status Toggle */}
          <button
            type="button"
            onClick={toggleNetwork}
            title={isOnline ? 'En ligne (cliquer pour simuler hors-ligne)' : 'Hors-ligne (cliquer pour reconnecter)'}
            aria-label={isOnline ? 'En ligne' : 'Hors-ligne'}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-1.5 sm:px-3 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400 sm:hidden shrink-0" />
                <span className="hidden sm:inline">En ligne</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <WifiOff className="w-3.5 h-3.5 text-rose-400 sm:hidden shrink-0" />
                <span className="hidden sm:inline">Hors-ligne</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={triggerSync}
            disabled={!isOnline || isSyncing}
            title="Synchroniser les données"
            aria-label="Synchroniser les données"
            className="inline-flex items-center justify-center gap-1.5 w-7 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
            <span className="hidden 2xl:inline">{isSyncing ? 'Sync...' : 'Sync'}</span>
          </button>

          {/* Desktop / Mobile Viewport Toggle (md+) */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
              title={viewMode === 'desktop' ? 'Aperçu mobile' : 'Vue bureau'}
              aria-label={viewMode === 'desktop' ? 'Aperçu mobile' : 'Vue bureau'}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              {viewMode === 'desktop' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Super Admin Settings */}
          {canAccessSettings && (
            <button
              type="button"
              onClick={openSettings}
              title="Paramètres API & connecteurs"
              aria-label="Paramètres API & connecteurs"
              className="inline-flex items-center justify-center w-7 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer shrink-0"
            >
              <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="inline-flex items-center justify-center w-7 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}

          {/* Profile Button */}
          <button
            type="button"
            onClick={openProfileModal}
            title="Mon profil & 2FA"
            aria-label="Mon profil & 2FA"
            className="inline-flex items-center justify-center gap-2 h-8 sm:h-9 px-1 sm:pl-1.5 sm:pr-3 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white/20 shrink-0"
            />
            <span className="hidden md:inline max-w-[110px] truncate">{currentUser.name}</span>
            <span className="hidden lg:inline text-[10px] text-neutral-300">({roleInfo.label})</span>
          </button>

          {/* Direct Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Se déconnecter"
            aria-label="Déconnexion"
            className="inline-flex items-center justify-center gap-1.5 w-7 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden xl:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Mobile Compact Module Tabs (below top bar on < lg screens) */}
      <div className="lg:hidden pt-2 mt-2 border-t border-neutral-100 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                isActive
                  ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40 font-bold'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
