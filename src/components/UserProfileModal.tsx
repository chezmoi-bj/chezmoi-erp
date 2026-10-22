import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Lock, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { UserAccount } from '../types';
import { ROLE_DEFINITIONS } from '../utils/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    Boolean(currentUser.twoFactorEnabled)
  );
  const [loading2FA, setLoading2FA] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setLoading2FA(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          enabled: nextVal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur modification 2FA');

      setTwoFactorEnabled(nextVal);
      const updatedUser: UserAccount = {
        ...currentUser,
        twoFactorEnabled: nextVal,
      };
      onUpdateUser(updatedUser);
      setStatusMsg(nextVal ? 'Double authentification (2FA) activée avec succès !' : '2FA désactivée.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg(`Erreur : ${err?.message}`);
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FA3055]/10 text-[#FA3055] flex items-center justify-center flex-shrink-0 font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#FA3055] uppercase tracking-wider">
              Compte & Sécurité
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Profil & Double Authentification (2FA)
            </h2>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5">
          <div className="flex items-center gap-3.5 mb-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#FA3055]/20 flex-shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 text-base truncate">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {currentUser.jobTitle} • {currentUser.departmentName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleInfo.badgeColor}`}>
                  {roleInfo.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentUser.contractType}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{currentUser.city} ({currentUser.assignedZone})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-emerald-700">Session active vérifiée</span>
            </div>
          </div>
        </div>

        {/* 2FA Toggle Section */}
        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-2xl p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#FA3055] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Double Authentification (2FA)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Exige systématiquement un code OTP à 6 chiffres par email lors de chaque connexion à la plateforme.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggle2FA}
              disabled={loading2FA}
              role="switch"
              aria-checked={twoFactorEnabled}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                twoFactorEnabled ? 'bg-[#FA3055]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {statusMsg && (
            <div className="mt-3 p-2 rounded-xl bg-white text-xs font-semibold text-slate-800 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Permissions & Roles Matrix */}
        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Modules autorisés pour votre rôle :</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{currentUser.role}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{roleInfo.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {roleInfo.allowedTabs.map((tabId) => (
              <span
                key={tabId}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 capitalize"
              >
                {tabId === 'dashboard' ? 'Tableau de bord' :
                 tabId === 'census' ? 'Recensement' :
                 tabId === 'accounting' ? 'Facturation (e-MECeF)' :
                 tabId === 'hr' ? 'Agents & RH' :
                 tabId === 'ged' ? 'GED foncière' : tabId}
              </span>
            ))}
          </div>
        </div>

        {/* Actions : Déconnexion & Fermer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
