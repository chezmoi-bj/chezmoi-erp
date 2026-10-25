import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  QrCode,
  Copy,
  Check
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
  const [totpData, setTotpData] = useState<{
    secret: string;
    otpauthUri: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Charger les données TOTP Google Authenticator si 2FA est activé
  useEffect(() => {
    if (isOpen && twoFactorEnabled) {
      fetch(`/api/auth/2fa/setup?userId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTotpData({
              secret: data.secret,
              otpauthUri: data.otpauthUri,
              qrCodeDataUrl: data.qrCodeDataUrl,
            });
          }
        })
        .catch(err => {
          console.error('Erreur chargement setup 2FA:', err);
        });
    }
  }, [isOpen, twoFactorEnabled, currentUser.id]);

  if (!isOpen) return null;

  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.warn('Clipboard fallback:', e);
    }
  };

  const handleCopySecret = (secret: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(secret).catch(() => {
          fallbackCopyText(secret);
        });
      } else {
        fallbackCopyText(secret);
      }
    } catch {
      fallbackCopyText(secret);
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setLoading2FA(true);
    setStatusMsg(null);

    try {
      let secretToPersist = totpData?.secret;
      
      // Si on active 2FA et qu'on n'a pas encore le setup TOTP, le récupérer d'abord
      if (nextVal && !secretToPersist) {
        const setupRes = await fetch(`/api/auth/2fa/setup?userId=${currentUser.id}`);
        const setupJson = await setupRes.json();
        if (setupJson.success) {
          secretToPersist = setupJson.secret;
          setTotpData(setupJson);
        }
      }

      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          enabled: nextVal,
          totpSecret: secretToPersist,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur modification 2FA');

      setTwoFactorEnabled(nextVal);
      const updatedUser: UserAccount = {
        ...currentUser,
        twoFactorEnabled: nextVal,
        totpSecret: secretToPersist,
      };
      onUpdateUser(updatedUser);
      setStatusMsg(
        nextVal 
          ? 'Double authentification (2FA) & Google Authenticator activés avec succès !' 
          : 'Double authentification désactivée.'
      );
      setTimeout(() => setStatusMsg(null), 4000);
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
            <div className="mt-3 p-2.5 rounded-xl bg-white text-xs font-semibold text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Google Authenticator (TOTP) Setup Section */}
          {twoFactorEnabled && (
            <div className="mt-4 pt-4 border-t border-rose-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Google Authenticator (TOTP)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Couche active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Mode par défaut :</strong> Le code OTP envoyé par e-mail reste actif à chaque connexion. En scannant ce code QR dans <strong className="text-slate-900">Google Authenticator</strong>, vous pouvez également utiliser les codes à 6 chiffres générés par votre téléphone.
                </p>

                {totpData ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
                    <div className="w-28 h-28 p-1.5 bg-white rounded-xl border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={totpData.qrCodeDataUrl}
                        alt="QR Code Google Authenticator"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0 w-full sm:w-auto">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Clé secrète TOTP (saisie manuelle)
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 truncate select-all flex-1">
                            {totpData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopySecret(totpData.secret)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                            title="Copier la clé"
                          >
                            {copiedKey ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] text-emerald-700">Copiée</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-[11px]">Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        Compatible avec Google Authenticator, Microsoft Authenticator et Twilio Authy.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FA3055]" />
                    <span className="text-xs text-slate-500 ml-2">Génération de la clé TOTP...</span>
                  </div>
                )}
              </div>
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
