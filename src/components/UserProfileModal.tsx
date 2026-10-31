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
  Award,
  Layers,
  KeyRound,
  ShieldAlert,
  QrCode,
  Copy,
  Check,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { ROLE_DEFINITIONS } from '../utils/auth';
import { apiFetch } from '../utils/api';

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
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [totpData, setTotpData] = useState<{
    secret: string;
    otpauthUri: string;
    qrCodeDataUrl: string;
    accountEmail: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Étape d'association TOTP
  const [isPairingStep, setIsPairingStep] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTwoFactorEnabled(Boolean(currentUser.twoFactorEnabled));
      // Si 2FA est déjà activé, précharger les données du secret
      if (currentUser.twoFactorEnabled) {
        loadTotpSetup();
      }
    } else {
      setIsPairingStep(false);
      setVerificationCode('');
      setStatusMsg(null);
    }
  }, [isOpen, currentUser.twoFactorEnabled, currentUser.id]);

  const loadTotpSetup = async () => {
    try {
      const res = await apiFetch(`/api/auth/2fa/setup?userId=${currentUser.id}`);
      if (res.ok && res.secret) {
        setTotpData({
          secret: res.secret,
          otpauthUri: res.otpauthUri,
          qrCodeDataUrl: res.qrCodeDataUrl,
          accountEmail: res.accountEmail || currentUser.email,
        });
      }
    } catch (err) {
      console.error('Erreur chargement setup TOTP:', err);
    }
  };

  if (!isOpen) return null;

  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  const handleCopySecret = (secret: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(secret).catch(() => {});
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = secret;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // Ignorer fallback
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Déclencheur du Toggle 2FA
  const handleToggleClick = async () => {
    if (!twoFactorEnabled) {
      // Pour ACTIVER : On ne valide pas à l'aveugle, on lance l'association TOTP (QR Code + vérification code)
      setIsPairingStep(true);
      setStatusMsg(null);
      if (!totpData) {
        setLoading2FA(true);
        await loadTotpSetup();
        setLoading2FA(false);
      }
    } else {
      // Pour DÉSACTIVER : Désactivation directe
      setLoading2FA(true);
      setStatusMsg(null);
      try {
        const res = await apiFetch('/api/auth/toggle-2fa', {
          method: 'POST',
          body: JSON.stringify({
            userId: currentUser.id,
            enabled: false,
          }),
        });

        if (!res.ok) throw new Error(res.error || 'Erreur lors de la désactivation');

        setTwoFactorEnabled(false);
        setIsPairingStep(false);
        const updated = { ...currentUser, twoFactorEnabled: false };
        onUpdateUser(updated);
        setStatusMsg({ text: 'Double authentification désactivée avec succès.' });
      } catch (err: any) {
        setStatusMsg({ text: err?.message || 'Erreur lors de la désactivation.', isError: true });
      } finally {
        setLoading2FA(false);
      }
    }
  };

  // Soumission et validation du code à 6 chiffres pour valider l'association TOTP
  const handleVerifyAndActivateTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setStatusMsg({ text: 'Veuillez saisir les 6 chiffres affichés dans votre application.', isError: true });
      return;
    }

    if (!totpData?.secret) {
      setStatusMsg({ text: 'Données de configuration manquantes. Veuillez recharger.', isError: true });
      return;
    }

    setPairingLoading(true);
    setStatusMsg(null);

    try {
      const res = await apiFetch('/api/auth/2fa/verify-activate', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          secret: totpData.secret,
          code: verificationCode.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Code invalide ou expiré. Vérifiez votre heure.');
      }

      setTwoFactorEnabled(true);
      setIsPairingStep(false);
      setVerificationCode('');
      const updated: UserAccount = {
        ...currentUser,
        twoFactorEnabled: true,
        totpSecret: totpData.secret,
      };
      onUpdateUser(updated);
      confetti({ particleCount: 40, spread: 60, colors: ['#FA3055', '#10B981'] });
      setStatusMsg({ text: 'Google Authenticator activé et vérifié avec succès pour ce compte !' });
    } catch (err: any) {
      setStatusMsg({ text: err?.message || 'Code erroné ou expiré.', isError: true });
    } finally {
      setPairingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* En-tête de la modale */}
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

        {/* Fiche Profil Collaborateur */}
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
              <span className="font-semibold text-emerald-700">Session authentifiée</span>
            </div>
          </div>
        </div>

        {/* Section Double Authentification (2FA) */}
        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-2xl p-4 border border-slate-200 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#FA3055] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Double Authentification (2FA)
                  </h4>
                  {twoFactorEnabled && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Actif (Google Authenticator)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Exige un code de validation TOTP à 6 chiffres généré par Google Authenticator ou une application compatible lors de chaque connexion.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={handleToggleClick}
              disabled={loading2FA || pairingLoading}
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

          {/* Messages de statut */}
          {statusMsg && (
            <div className={`mt-3 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs border ${
              statusMsg.isError 
                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {statusMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Étape d'association Google Authenticator (TOTP) */}
          {isPairingStep && !twoFactorEnabled && (
            <div className="mt-4 pt-4 border-t border-rose-100 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-xs font-bold text-slate-900">
                  Association de Google Authenticator
                </h5>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1. Ouvrez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre smartphone.<br />
                  2. Scannez le code QR ci-dessous (ou saisissez manuellement la clé secrète).
                </p>

                {totpData ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="w-32 h-32 p-2 bg-white rounded-xl border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={totpData.qrCodeDataUrl}
                        alt="QR Code Google Authenticator"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0 w-full">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Clé secrète (saisie manuelle)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 truncate select-all flex-1">
                          {totpData.secret}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopySecret(totpData.secret)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                          title="Copier"
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
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FA3055]" />
                    <span className="text-xs text-slate-500 ml-2">Génération du QR Code...</span>
                  </div>
                )}

                {/* Saisie du code à 6 chiffres pour valider l'activation */}
                <form onSubmit={handleVerifyAndActivateTotp} className="pt-2 border-t border-slate-100 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Saisissez le code à 6 chiffres généré par votre application :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-center text-lg font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FA3055]"
                    />
                    <button
                      type="submit"
                      disabled={pairingLoading || verificationCode.length !== 6}
                      className="px-4 py-2 rounded-xl bg-[#FA3055] hover:bg-[#E02045] disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      {pairingLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Valider & activer</span>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsPairingStep(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer underline"
                    >
                      Annuler la configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Affichage des clés en mode actif si nécessaire */}
          {twoFactorEnabled && totpData && !isPairingStep && (
            <div className="mt-3 pt-3 border-t border-rose-100/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Clé configurée : <code className="font-mono text-slate-700">{totpData.secret.substring(0, 8)}...</code></span>
              <button
                type="button"
                onClick={() => setIsPairingStep(true)}
                className="text-[#FA3055] font-semibold hover:underline cursor-pointer"
              >
                Afficher le QR Code
              </button>
            </div>
          )}
        </div>

        {/* Matrice des droits & rôles */}
        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Modules autorisés pour votre rôle :</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{currentUser.role}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{roleInfo.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {roleInfo.allowedTabs.map(tab => (
              <span key={tab} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 capitalize">
                {tab === 'accounting' ? 'Facturation e-MECeF' : tab}
              </span>
            ))}
          </div>
        </div>

        {/* Boutons du bas */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
