import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, MapPin, User, ChevronRight, Sparkles } from 'lucide-react';
import { AppNotification, PropertyRecord } from '../types';
import { requestBrowserNotificationPermission } from '../utils/notifications';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectPropertyById: (propertyId: string) => void;
  allProperties?: PropertyRecord[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectPropertyById,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEnablePush = async () => {
    const granted = await requestBrowserNotificationPermission();
    setHasPermission(granted);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.targetPropertyId) {
      onSelectPropertyById(notif.targetPropertyId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Centre de notifications (Secrétaires & Administrateurs)"
        aria-label="Centre de notifications"
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
          isOpen
            ? 'bg-[#FA3055] text-white border-[#FA3055] shadow-sm'
            : 'bg-white dark:bg-[#161B22] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-[#FA3055]/40 hover:bg-[#F4F6F5] dark:hover:bg-[#1D222B]'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FA3055] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#12151B] border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-[#161B22]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FA3055]/10 text-[#FA3055] flex items-center justify-center font-bold text-xs">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  Notifications
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#FA3055] hover:text-[#d41c3f] cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout marquer lu</span>
              </button>
            )}
          </div>

          {/* Web Push Prompt if not enabled */}
          {!hasPermission && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#FA3055] flex-shrink-0" />
                <span>Activer les alertes directes (Web Push / OS)</span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-2.5 py-1 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white text-[10px] font-bold cursor-pointer transition-all shadow-2xs whitespace-nowrap"
              >
                Autoriser
              </button>
            </div>
          )}

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold">Aucune notification pour le moment</p>
                <p className="text-[11px] mt-0.5">Les nouveaux recensements apparaîtront ici.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const timeAgo = formatTimeAgo(notif.timestamp);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.read 
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30' 
                        : 'hover:bg-slate-50 dark:hover:bg-[#161B22]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !notif.read ? 'bg-[#FA3055]' : 'bg-transparent'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#FA3055] uppercase tracking-wider">
                          Recensement terrain
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {timeAgo}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {notif.propertyName || notif.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {notif.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{notif.location}</span>
                          </span>
                        )}
                        {notif.agentName && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <User className="w-3 h-3 text-[#FA3055]" />
                            <span>{notif.agentName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 self-center flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/80 dark:bg-[#161B22] border-t border-slate-100 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Synchronisé en temps réel avec Chezmoi MySQL
            </span>
          </div>

        </div>
      )}
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} j`;
}
