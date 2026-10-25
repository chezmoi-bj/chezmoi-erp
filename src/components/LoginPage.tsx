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
  const [identifier, setIdentifier] = useState<string>('chezmoi.benin@gmail.com');
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
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identToSend.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.pendingVerification) {
          setPendingVerificationEmail(data.email || identToSend);
        }
        throw new Error(data.error || 'Identifiant non reconnu.');
      }

      setPendingVerificationEmail(null);
      setMaskedTarget(data.maskedTarget || data.email || identToSend);
      setIs2FARequired(Boolean(data.twoFactorRequired));
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
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCodeInput.trim(),
          email: targetEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Code invalide ou expiré.');
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
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: fullOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code de vérification invalide.');
      }

      onLoginSuccess(data.user, data.token);
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
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 font-sans select-none relative overflow-hidden ${
        isDark ? 'bg-[#08090A] text-[#F3F4F6]' : 'bg-[#FAFAFA] text-[#0F172A]'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)'
          : 'radial-gradient(rgba(15, 23, 42, 0.07) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Ambient luxury radial glow matching #F91942 */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark 
            ? 'opacity-100 bg-[radial-gradient(circle_at_50%_45%,rgba(249,25,66,0.08),transparent_65%)]' 
            : 'opacity-100 bg-[radial-gradient(circle_at_50%_45%,rgba(249,25,66,0.05),transparent_65%)]'
        }`}
      />

      {/* Top Bar with Discreet Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-end z-10">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer backdrop-blur-md border ${
            isDark 
              ? 'bg-[#121417]/80 text-zinc-300 border-white/10 hover:border-white/20 hover:text-white' 
              : 'bg-white/80 text-slate-700 border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-xs'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] tracking-wide">Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] tracking-wide">Sombre</span>
            </>
          )}
        </button>
      </header>

      {/* Main Centered Minimal Form */}
      <main className="w-full max-w-[420px] mx-auto px-5 my-auto z-10 py-4">
        
        {/* Card */}
        <div 
          className={`rounded-3xl p-7 sm:p-9 transition-all duration-300 backdrop-blur-xl border ${
            isDark 
              ? 'bg-[#0E1013]/90 border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)]' 
              : 'bg-white/95 border-slate-200/80 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.07)]'
          }`}
        >

          {/* Logo officiel Chezmoi (Strictement au-dessus de la saisie) */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <img 
                src="/assets/aistudio/1_e24ebf1b.png" 
                alt="Chezmoi" 
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight mt-4 text-center ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {step === 'identifier' ? 'Connexion' : 'Code de vérification'}
            </h1>
            
            <p className={`text-xs mt-1 text-center font-normal ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              {step === 'identifier' 
                ? 'Accédez à votre espace sécurisé' 
                : is2FARequired
                ? 'Code OTP e-mail ou code Google Authenticator'
                : `Code temporaire transmis à ${maskedTarget}`}
            </p>
          </div>

          {/* Verification Success Banner */}
          {verificationSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span className="font-medium leading-relaxed">{verificationSuccess}</span>
            </div>
          )}

          {/* Pending Account Verification Block */}
          {pendingVerificationEmail && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-400">Compte en attente de validation</p>
                  <p className={`mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'} leading-relaxed`}>
                    Un e-mail contenant votre code de confirmation a été envoyé à <strong>{pendingVerificationEmail}</strong>. Veuillez saisir ce code ci-dessous :
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
                    isDark ? 'bg-[#14171B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleValidateAccountCode}
                  disabled={loading || verificationCodeInput.length < 6}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2B53] to-[#D8072E] text-white text-xs font-bold hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  {loading ? 'Validation...' : 'Valider'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* STEP 1: Identification */}
          {step === 'identifier' && (
            <form onSubmit={(e) => { e.preventDefault(); handleRequestOtp(); }}>
              <div className="mb-4">
                <label 
                  htmlFor="identifier-input"
                  className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}
                >
                  E-mail ou Téléphone
                </label>

                <div className="relative">
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
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all outline-hidden border ${
                      isDark 
                        ? 'bg-[#14171B] border-white/10 text-white placeholder-zinc-500 focus:border-[#F91942] focus:ring-1 focus:ring-[#F91942]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#F91942] focus:ring-1 focus:ring-[#F91942]'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button with #F91942 Gradient & Luxury Hover Overlay */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden group w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF2B53] via-[#F91942] to-[#D8072E] text-white font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-[0_4px_24px_rgba(249,25,66,0.38)] hover:shadow-[0_6px_32px_rgba(249,25,66,0.6)] hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {/* Refined light shimmer overlay on hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
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
              {/* Notice 2FA (if enabled) */}
              {is2FARequired && (
                <div className={`mb-3.5 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  isDark ? 'bg-[#F91942]/10 text-[#F91942] border border-[#F91942]/20' : 'bg-rose-50 text-[#F91942] border border-rose-200'
                }`}>
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>2FA Active : Code OTP e-mail ou code Google Authenticator</span>
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
                    className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border transition-all outline-hidden ${
                      isDark 
                        ? 'bg-[#14171B] border-white/10 text-white focus:border-[#F91942] focus:ring-1 focus:ring-[#F91942]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#F91942] focus:ring-1 focus:ring-[#F91942]'
                    }`}
                  />
                ))}
              </div>

              {/* Submit Button with #F91942 Gradient & Luxury Hover Overlay */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpDigits.some(d => d === '')}
                className="relative overflow-hidden group w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF2B53] via-[#F91942] to-[#D8072E] text-white font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-[0_4px_24px_rgba(249,25,66,0.38)] hover:shadow-[0_6px_32px_rgba(249,25,66,0.6)] hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {/* Refined light shimmer overlay on hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Déverrouillage...</span>
                  </>
                ) : (
                  <span>Valider la session</span>
                )}
              </button>

              {/* Back & Resend */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('identifier');
                    setError(null);
                  }}
                  className={`flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>

                {countdown > 0 ? (
                  <span className={`font-mono text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {formatTime(countdown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    className="text-[#F91942] hover:underline cursor-pointer font-medium text-[11px]"
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
        <p className={`text-[11px] font-normal tracking-wide ${
          isDark ? 'text-zinc-600' : 'text-slate-400'
        }`}>
          Chezmoi • Tous droits réservés
        </p>
      </footer>

    </div>
  );
};
