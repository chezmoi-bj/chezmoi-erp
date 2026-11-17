import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Sun, 
  Moon, 
  Lock
} from 'lucide-react';
import { UserAccount } from '../types';
import { apiFetch } from '../utils/api';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount, token: string) => void;
  allUsers?: UserAccount[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme: propTheme,
  onToggleTheme,
}) => {
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('chezmoi_theme') as 'dark' | 'light') || 
           (localStorage.getItem('chezmoi_auth_theme') as 'dark' | 'light') || 'dark';
  });

  const activeTheme = propTheme || localTheme;
  const isDark = activeTheme === 'dark';

  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string>('');
  const [is2FARequired, setIs2FARequired] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(300);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. SÉCURITÉ CÔTÉ CLIENT : Bloquer le clic droit & raccourcis d'inspection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Détection d'une validation d'e-mail par URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('email_verified') === 'true') {
        const verifiedEmail = params.get('email');
        if (verifiedEmail && verifiedEmail.trim()) {
          setIdentifier(verifiedEmail.trim());
        }
        setVerificationSuccess('Votre compte a été vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // Ignored in non-browser environments
    }
  }, []);

  // Bascule du thème avec synchronisation globale
  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      setLocalTheme(nextTheme);
      localStorage.setItem('chezmoi_theme', nextTheme);
      localStorage.setItem('chezmoi_auth_theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.classList.toggle('light', nextTheme === 'light');
    }
  };

  // Timer countdown OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus automatique au passage à l'étape OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 120);
    }
  }, [step]);

  // Étape 1 : Demande de code OTP
  const handleRequestOtp = async (targetId?: string) => {
    const identToSend = targetId || identifier;
    if (!identToSend.trim()) {
      setError('Veuillez saisir votre e-mail ou téléphone.');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationSuccess(null);

    try {
      const response = await apiFetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier: identToSend.trim() }),
      });

      if (!response.ok) {
        if (response.pendingVerification) {
          setPendingVerificationEmail(response.email || identToSend);
        }
        throw new Error(response.error || 'Identifiant non reconnu.');
      }

      setPendingVerificationEmail(null);
      setMaskedTarget(response.maskedTarget || response.email || identToSend);
      setIs2FARequired(Boolean(response.twoFactorRequired));
      setCountdown(300);
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la vérification.');
    } finally {
      setLoading(false);
    }
  };

  // Validation directe par code reçu par e-mail
  const handleValidateAccountCode = async () => {
    if (!verificationCodeInput.trim()) {
      setError('Veuillez entrer le code de validation reçu par e-mail.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetEmail = pendingVerificationEmail || identifier;
      const res = await apiFetch('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          code: verificationCodeInput.trim(),
          email: targetEmail
        })
      });

      if (!res.ok) {
        throw new Error(res.error || 'Code invalide ou expiré.');
      }

      setVerificationSuccess('Compte validé avec succès ! Déverrouillage en cours...');
      setPendingVerificationEmail(null);
      setVerificationCodeInput('');

      // Déclenchement automatique de la connexion OTP
      setTimeout(() => {
        handleRequestOtp(targetEmail);
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la validation du compte.');
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérification du code OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Le code doit comporter 6 chiffres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: fullOtp,
        }),
      });

      if (!response.ok) {
        throw new Error(response.error || 'Code de vérification invalide.');
      }

      onLoginSuccess(response.user, response.token);
    } catch (err: any) {
      setError(err?.message || 'Code erroné ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des 6 cases individuelles de chiffres
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== '') && index === 5) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-200 select-none relative overflow-hidden ${
        isDark ? 'bg-[#0B0D10] text-neutral-100' : 'bg-[#FAFAFA] text-[#141414]'
      }`}
    >
      {/* Top Bar with Minimal Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img
            src="./assets/aistudio/1_e24ebf1b.png"
            alt="Chezmoi"
            className="w-8 h-8 object-contain"
          />
          <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#141414]'}`}>
            chezmoi <span className="font-medium text-neutral-400">administration</span>
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer border border-white/10"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Mode clair</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-neutral-200" />
              <span>Mode sombre</span>
            </>
          )}
        </button>
      </header>

      {/* Main Centered Minimal Form */}
      <main className="w-full max-w-[430px] mx-auto px-5 my-auto z-10 py-6">
        <div
          className={`rounded-2xl p-7 sm:p-9 transition-all border ${
            isDark
              ? 'bg-[#13161B] border-white/10 shadow-xl'
              : 'bg-white border-neutral-200 shadow-2xs'
          }`}
        >
          {/* Logo officiel Chezmoi */}
          <div className="flex flex-col items-center justify-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] dark:bg-[#1B1F27] border border-neutral-200 dark:border-white/10 flex items-center justify-center p-2.5 mb-4">
              <img
                src="./assets/aistudio/1_e24ebf1b.png"
                alt="Chezmoi"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className={`text-2xl font-extrabold tracking-tight text-center ${
              isDark ? 'text-white' : 'text-[#141414]'
            }`}>
              {step === 'identifier' ? 'Connexion' : 'Vérification sécurisée'}
            </h1>

            <p className={`text-xs mt-1.5 text-center font-medium ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              {step === 'identifier'
                ? 'Accédez à votre espace Chezmoi administration'
                : is2FARequired
                ? 'Saisissez le code OTP e-mail ou Google Authenticator'
                : `Code à 6 chiffres envoyé à ${maskedTarget}`}
            </p>
          </div>

          {/* Verification Success Banner */}
          {verificationSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium leading-relaxed">{verificationSuccess}</span>
            </div>
          )}

          {/* Pending Account Verification Block */}
          {pendingVerificationEmail && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300">Compte en attente de validation</p>
                  <p className={`mt-0.5 ${isDark ? 'text-neutral-300' : 'text-neutral-600'} leading-relaxed`}>
                    Un e-mail contenant votre code de confirmation a été envoyé à <strong>{pendingVerificationEmail}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Code à 6 chiffres"
                  className={`flex-1 px-3 py-2 rounded-xl text-center text-sm font-mono tracking-widest font-bold outline-hidden border ${
                    isDark ? 'bg-[#181C22] border-white/10 text-white' : 'bg-white border-neutral-200 text-[#141414]'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleValidateAccountCode}
                  disabled={loading || verificationCodeInput.length < 6}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {loading ? 'Validation...' : 'Valider'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* STEP 1: Identification */}
          {step === 'identifier' && (
            <form onSubmit={(e) => { e.preventDefault(); handleRequestOtp(); }} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier-input"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  E-mail ou téléphone professionnel
                </label>

                <input
                  id="identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="nom@chezmoi.bj ou +229..."
                  required
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors outline-hidden border ${
                    isDark
                      ? 'bg-[#181C22] border-white/10 text-white placeholder-neutral-500 focus:border-white/40'
                      : 'bg-[#FAFAFA] border-neutral-200 text-[#141414] placeholder-neutral-400 focus:border-[#141414] focus:bg-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <span>Continuer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Saisie Code OTP (6 Chiffres) */}
          {step === 'otp' && (
            <div>
              {is2FARequired && (
                <div className={`mb-4 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  isDark ? 'bg-white/5 text-neutral-200 border-white/10' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}>
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>2FA active : code OTP e-mail ou Google Authenticator</span>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border transition-colors outline-hidden tabular-nums ${
                      isDark
                        ? 'bg-[#181C22] border-white/10 text-white focus:border-white/40'
                        : 'bg-[#FAFAFA] border-neutral-200 text-[#141414] focus:border-[#141414] focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpDigits.some(d => d === '')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Déverrouillage...</span>
                  </>
                ) : (
                  <span>Valider la session</span>
                )}
              </button>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-200/80 dark:border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('identifier');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>

                {countdown > 0 ? (
                  <span className={`font-mono text-xs tabular-nums ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {formatTime(countdown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Renvoyer un code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-5 text-center z-10">
        <p className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Chezmoi administration • Tous droits réservés
        </p>
      </footer>
    </div>
  );
};
