import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Zap, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { googleProvider, appleProvider, firebaseAuth } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset-sent';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const { login, register, socialLogin } = useAppStore();
  const [mode, setMode] = useState<AuthMode>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    reset();
    try {
      const provider = providerName === 'google' ? googleProvider : appleProvider;
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      await socialLogin(idToken, providerName);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    reset();
    try {
      await login(email, password);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      await register({ email, password, fullName });
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setIsLoading(true);
    reset();
    // Simulate sending reset email (real backend would send actual email)
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setMode('reset-sent');
  };

  const inputBase = 'w-full rounded-2xl border bg-slate-950/60 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Background depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Zap className="w-7 h-7 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight">STRIDE</h1>
            <p className="text-xs text-slate-400 mt-1">Premium GPS Fitness & Activity Tracker</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.06] bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-5">

          {/* ─── LOGIN ─── */}
          {mode === 'login' && (
            <>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold font-display text-white">Welcome back</h2>
                <p className="text-xs text-slate-400">Sign in to access your training data</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`${inputBase} pl-10 border-white/[0.06]`} placeholder="Email address" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pl-10 pr-10 border-white/[0.06]`} placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => { setMode('forgot'); reset(); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Forgot password?
                  </button>
                </div>

                {error && <ErrorBanner message={error} />}

                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-500/20">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
               </form>

               <Divider />
               <SocialButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />

               <p className="text-center text-xs text-slate-500">
                 Don't have an account?{' '}
                 <button onClick={() => { setMode('register'); reset(); }} className="text-emerald-400 font-bold hover:text-emerald-300">
                   Create account
                 </button>
               </p>
             </>
           )}

          {/* ─── REGISTER ─── */}
          {mode === 'register' && (
            <>
              <div>
                <h2 className="text-xl font-extrabold font-display text-white">Create your account</h2>
                <p className="text-xs text-slate-400 mt-0.5">Start tracking your workouts for free</p>
              </div>

               <form onSubmit={handleRegister} className="space-y-3">
                 <div className="relative">
                   <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                   <input id="reg-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                     className={`${inputBase} pl-10 border-white/[0.06]`} placeholder="Full name" />
                 </div>
                 <div className="relative">
                   <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                   <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className={`${inputBase} pl-10 border-white/[0.06]`} placeholder="Email address" />
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                   <input id="reg-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                     className={`${inputBase} pl-10 pr-10 border-white/[0.06]`} placeholder="Password (min. 6 characters)" />
                   <button type="button" onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                   <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                     className={`${inputBase} pl-10 pr-10 border-white/[0.06]`} placeholder="Confirm password" />
                   <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                     className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                     {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                 </div>

                 {error && <ErrorBanner message={error} />}

                 <button type="submit" disabled={isLoading}
                   className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-500/20">
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                   {isLoading ? 'Creating account...' : 'Create Free Account'}
                 </button>
               </form>

               <Divider />
               <SocialButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />

               <p className="text-center text-xs text-slate-500">
                 Already have an account?{' '}
                 <button onClick={() => { setMode('login'); reset(); }} className="text-emerald-400 font-bold hover:text-emerald-300">
                   Sign in
                 </button>
               </p>

              <p className="text-center text-[11px] text-slate-600">
                By creating an account you agree to our{' '}
                <span className="text-slate-400 cursor-pointer hover:text-slate-300">Terms of Service</span>
                {' '}and{' '}
                <span className="text-slate-400 cursor-pointer hover:text-slate-300">Privacy Policy</span>.
              </p>
            </>
          )}

          {/* ─── FORGOT PASSWORD ─── */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); reset(); }} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </button>

              <div>
                <h2 className="text-xl font-extrabold font-display text-white">Reset your password</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter the email address linked to your Stride account and we'll send you a secure password reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className={`${inputBase} pl-10 border-white/[0.06]`} placeholder="Your email address" />
                </div>

                {error && <ErrorBanner message={error} />}

                <button type="submit" disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* ─── RESET SENT CONFIRMATION ─── */}
          {mode === 'reset-sent' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold font-display text-white">Check your inbox</h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  We've sent a password reset link to <span className="text-white font-semibold">{email}</span>. 
                  It may take a minute to arrive — also check your spam folder.
                </p>
              </div>
              <button
                onClick={() => { setMode('login'); reset(); setEmail(''); setPassword(''); }}
                className="mx-auto flex items-center gap-2 text-xs text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <p className="text-xs font-medium leading-snug">{message}</p>
  </div>
);

const Divider: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-slate-800" />
    <span className="text-[11px] text-slate-600 font-semibold">OR CONTINUE WITH</span>
    <div className="flex-1 h-px bg-slate-800" />
  </div>
);

const SocialButtons: React.FC<{ onSocialLogin: (provider: 'google' | 'apple') => void; isLoading: boolean }> = ({ onSocialLogin, isLoading }) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => onSocialLogin('google')}
      disabled={isLoading}
      className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/[0.06] bg-slate-950 hover:bg-slate-900 hover:border-white/[0.08] text-xs font-semibold text-white transition-all disabled:opacity-60"
    >
      {/* Google SVG Icon */}
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Google
    </button>
    <button
      type="button"
      onClick={() => onSocialLogin('apple')}
      disabled={isLoading}
      className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/[0.06] bg-slate-950 hover:bg-slate-900 hover:border-white/[0.08] text-xs font-semibold text-white transition-all disabled:opacity-60"
    >
      {/* Apple SVG Icon */}
      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      Apple
    </button>
  </div>
);
