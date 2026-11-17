import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  User,
  LogOut,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  AlertCircle,
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
  const [avatarFailed, setAvatarFailed] = useState<boolean>(false);

  const [isPairingStep, setIsPairingStep] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTwoFactorEnabled(Boolean(currentUser.twoFactorEnabled));
      setAvatarFailed(false);
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
      }
    } catch {
      // ignore fallback
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleToggleClick = async () => {
    if (!twoFactorEnabled) {
      setIsPairingStep(true);
      setStatusMsg(null);
      if (!totpData) {
        setLoading2FA(true);
        await loadTotpSetup();
        setLoading2FA(false);
      }
    } else {
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
        onUpdateUser({ ...currentUser, twoFactorEnabled: false });
        setStatusMsg({ text: 'Double authentification désactivée avec succès.' });
      } catch (err: any) {
        setStatusMsg({ text: err?.message || 'Erreur lors de la désactivation.', isError: true });
      } finally {
        setLoading2FA(false);
      }
    }
  };

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
      onUpdateUser({
        ...currentUser,
        twoFactorEnabled: true,
        totpSecret: totpData.secret,
      });
      confetti({ particleCount: 40, spread: 60, colors: ['#141414', '#10B981'] });
      setStatusMsg({ text: 'Google Authenticator activé et vérifié avec succès pour ce compte !' });
    } catch (err: any) {
      setStatusMsg({ text: err?.message || 'Code erroné ou expiré.', isError: true });
    } finally {
      setPairingLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Profil et Double Authentification"
    >
      <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-white/10 relative my-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] flex items-center justify-center text-white cursor-pointer transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-neutral-200 dark:border-white/10 pb-4 pr-10">
          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Compte & Sécurité
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#141414] dark:text-white mt-0.5">
              Profil & Double Authentification (2FA)
            </h2>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-[#FAFAFA] dark:bg-[#181C22] rounded-xl p-4 border border-neutral-200 dark:border-white/10 mb-5">
          <div className="flex items-center gap-3.5 mb-3">
            {currentUser.avatar && !avatarFailed ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-neutral-200 dark:ring-white/15 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#141414] text-white flex items-center justify-center font-bold text-base shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#141414] dark:text-white text-base truncate">
                {currentUser.name}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">
                {currentUser.jobTitle} • {currentUser.departmentName}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-white/10 text-[#141414] dark:text-white">
                  {roleInfo.label}
                </span>
                <span className="text-[10px] text-neutral-400">{currentUser.contractType}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">
                {currentUser.city} ({currentUser.assignedZone})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Session authentifiée</span>
            </div>
          </div>
        </div>

        {/* 2FA Section */}
        <div className="bg-[#FAFAFA] dark:bg-[#181C22] rounded-xl p-4 border border-neutral-200 dark:border-white/10 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-[#141414] dark:text-white">
                    Double Authentification (2FA)
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      twoFactorEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-neutral-200/70 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                    }`}
                  >
                    {twoFactorEnabled ? 'Actif (Google Auth)' : 'Désactivé'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Exige un code de validation TOTP à 6 chiffres généré par Google Authenticator lors de chaque connexion.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleClick}
              disabled={loading2FA || pairingLoading}
              role="switch"
              aria-checked={twoFactorEnabled}
              aria-label="Activer ou désactiver la double authentification"
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-neutral-300 dark:border-white/20 bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200 ease-in-out ${
                  twoFactorEnabled ? 'translate-x-5 bg-emerald-400' : 'translate-x-0.5 bg-white'
                }`}
              />
            </button>
          </div>

          {statusMsg && (
            <div
              className={`mt-3 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                statusMsg.isError
                  ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {statusMsg.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {isPairingStep && !twoFactorEnabled && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#141414] text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-xs font-bold text-[#141414] dark:text-white">
                  Association de Google Authenticator
                </h5>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 space-y-3">
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  1. Ouvrez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre smartphone.
                  <br />
                  2. Scannez le code QR ci-dessous (ou saisissez manuellement la clé secrète).
                </p>

                {totpData ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="w-32 h-32 p-2 bg-white rounded-xl border border-neutral-200 shrink-0 flex items-center justify-center">
                      <img
                        src={totpData.qrCodeDataUrl}
                        alt="QR Code Google Authenticator"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0 w-full">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Clé secrète (saisie manuelle)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-[#141414] dark:text-white bg-neutral-100 dark:bg-white/10 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 truncate select-all flex-1">
                          {totpData.secret}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopySecret(totpData.secret)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Copier"
                        >
                          {copiedKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px]">Copiée</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#141414] dark:text-white" />
                    <span className="text-xs text-neutral-500 ml-2">Génération du QR Code...</span>
                  </div>
                )}

                <form onSubmit={handleVerifyAndActivateTotp} className="pt-2 border-t border-neutral-200 dark:border-white/10 space-y-2.5">
                  <label className="block text-xs font-bold text-[#141414] dark:text-white">
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
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-300 dark:border-white/15 font-mono text-center text-lg font-bold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#141414]/25 tabular-nums"
                    />
                    <button
                      type="submit"
                      disabled={pairingLoading || verificationCode.length !== 6}
                      className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
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
                      className="px-3 py-1 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Annuler la configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {twoFactorEnabled && totpData && !isPairingStep && (
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Clé configurée : <code className="font-mono text-[#141414] dark:text-white">{totpData.secret.substring(0, 8)}...</code>
              </span>
              <button
                type="button"
                onClick={() => setIsPairingStep(true)}
                className="px-3 py-1 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-[11px] cursor-pointer"
              >
                Afficher le QR Code
              </button>
            </div>
          )}
        </div>

        {/* Permissions matrix */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#141414] dark:text-white">Modules autorisés pour votre rôle :</span>
            <span className="text-[10px] text-neutral-400 uppercase font-mono">{currentUser.role}</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2">{roleInfo.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {roleInfo.allowedTabs.map((tab) => (
              <span
                key={tab}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-[10px] font-semibold text-[#141414] dark:text-neutral-200 capitalize"
              >
                {tab === 'accounting' ? 'Facturation e-MECeF' : tab}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Déconnexion</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
