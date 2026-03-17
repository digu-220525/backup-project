import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // This should be from .env but for simplicity
        callback: async (response) => {
          setError('');
          setLoading(true);
          try {
            await googleLogin(response.credential);
            navigate('/dashboard');
          } catch (err) {
            setError('Google authentication failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      });
    }
  }, [googleLogin, navigate]);

  const handleGoogleLogin = () => {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    } else {
      setError('Google script not loaded. Please check your connection.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d[0].msg : 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">

      {/* ── Full-bleed background photo ── */}
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=95&auto=format&fit=crop&crop=center"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '60% center', filter: 'brightness(0.38) saturate(1.1) contrast(1.08)' }}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=95&auto=format&fit=crop'; }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(6,9,26,0.70) 0%,rgba(13,17,48,0.55) 50%,rgba(6,9,26,0.68) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(99,102,241,0.12) 0%,transparent 65%)' }} />

      {/* ── Centered glass card ── */}
      <div className="relative z-10 w-full max-w-[580px]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: 'all 0.6s cubic-bezier(.16,1,.3,1)' }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.40)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <span className="text-white font-black text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>VantagePoint</span>
        </div>

        {/* Glass form card */}
        <div className="rounded-[22px] overflow-hidden"
          style={{
            background: 'rgba(8,12,32,0.82)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          <div className="p-8">
            {/* Heading */}
            <div className="text-center mb-7"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.15s' }}>
              <h1 className="text-2xl font-black text-white mb-1.5"
                style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.02em' }}>
                Welcome back 👋
              </h1>
              <p className="text-white/40 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Google SSO button */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.18s' }}>
              <button type="button" onClick={handleGoogleLogin}
                className="group w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-white/85 transition-all duration-200 hover:bg-white/[0.09] active:scale-[0.98] mb-5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5"
              style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease 0.22s' }}>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-white/25 text-sm font-medium px-2">or sign in with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.25s' }}>
                <label className="block text-[12px] font-bold text-white/35 uppercase tracking-[0.25em] mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/22 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-4 rounded-xl text-white text-base font-medium outline-none transition-all duration-200 placeholder-white/20"
                    style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
                    onFocus={e => { e.target.style.background = 'rgba(99,102,241,0.07)'; e.target.style.border = '1px solid rgba(129,140,248,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.055)'; e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.30s' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[12px] font-bold text-white/35 uppercase tracking-[0.25em]">Password</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/22 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-4 rounded-xl text-white text-base font-medium outline-none transition-all duration-200 placeholder-white/20"
                    style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
                    onFocus={e => { e.target.style.background = 'rgba(99,102,241,0.07)'; e.target.style.border = '1px solid rgba(129,140,248,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.055)'; e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.34s' }}>
                <button type="submit" disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-bold text-white overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 60%,#7c3aed 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 20px rgba(99,102,241,0.38)' }}>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12 pointer-events-none" />
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /></>
                  }
                </button>
              </div>
            </form>

            <p className="text-center text-base text-white/35 mt-6"
              style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.40s' }}>
              New here?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create a free account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-center mt-5 text-white/30 text-[13px] font-medium"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.45s' }}>
          🔒 Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage;