import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAppContext } from '../../store/AppContext';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password mode: 'none' | 'email_reset' | 'recovery_code'
  const [forgotMode, setForgotMode] = useState<'none' | 'email_reset' | 'recovery_code'>('none');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { adminLoggedIn, authLoading } = useAppContext();

  // If already logged in, redirect straight to /admin
  useEffect(() => {
    if (!authLoading && adminLoggedIn) {
      navigate('/admin');
    }
  }, [adminLoggedIn, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Verify admin role in Firestore
      let isAdmin = false;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.admin && data.admin.status !== 'inactive') {
            isAdmin = true;
          }
        }
      } catch {
        // Fallback to direct client read
      }

      if (!isAdmin) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().status !== 'inactive') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        await signOut(auth);
        setError('Access denied: This account is not authorized as an active administrator.');
        setLoading(false);
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      console.error('Firebase Auth Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please wait a few minutes or reset your password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, recoveryEmail.trim());
      setSuccess('If an administrator account exists with this email, a password reset link has been dispatched.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Generic response for security
      setSuccess('If an administrator account exists with this email, a password reset link has been dispatched.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !recoveryCode.trim() || !newPassword) {
      setError('Please fill in all recovery fields.');
      return;
    }
    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recovery-code/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code: recoveryCode.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to redeem recovery code.');
      } else {
        setSuccess('Password updated successfully! Please sign in with your new password, then generate a fresh recovery code in Settings.');
        setRecoveryCode('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setForgotMode('none');
          setEmail(recoveryEmail);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to recovery server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col items-center justify-center p-6 relative z-10 font-sans">
      <div className="w-full max-w-md bg-[#FCFBF8] border border-[#E6DFD5] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2B87C]/5 rounded-bl-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4 bg-[#0C0C34] rounded-full p-1.5 shadow-lg">
            <img src="/logo.png" alt="Perennials Visa Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-xl font-bold text-[#3E3A35] tracking-widest uppercase">Admin Portal</h1>
          <p className="text-xs text-[#7A7369] mt-1">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {forgotMode === 'none' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@perennialsvisa.com"
                className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors placeholder:text-[#7A7369]/40"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-[#7A7369]">Password</label>
                <button
                  type="button"
                  className="text-xs text-[#E2B87C] hover:underline"
                  onClick={() => {
                    setForgotMode('email_reset');
                    setError('');
                    setSuccess('');
                    setRecoveryEmail(email);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7369] hover:text-[#3E3A35]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </Button>
          </form>
        )}

        {forgotMode === 'email_reset' && (
          <form onSubmit={handleEmailReset} className="space-y-4 relative z-10">
            <div className="text-center mb-2">
              <h2 className="text-sm font-semibold text-[#3E3A35]">Password Reset</h2>
              <p className="text-xs text-[#7A7369] mt-0.5">Send a secure reset link to your administrator email</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="admin@perennialsvisa.com"
                className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Send Reset Link</span>
            </Button>

            <div className="pt-2 border-t border-[#E6DFD5] space-y-2 text-center">
              <button
                type="button"
                className="text-xs text-[#E2B87C] hover:underline flex items-center justify-center gap-1.5 w-full"
                onClick={() => {
                  setForgotMode('recovery_code');
                  setError('');
                  setSuccess('');
                }}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Use Emergency Recovery Code Instead</span>
              </button>

              <button
                type="button"
                className="text-xs text-[#7A7369] hover:text-[#3E3A35] flex items-center justify-center gap-1 w-full pt-1"
                onClick={() => {
                  setForgotMode('none');
                  setError('');
                  setSuccess('');
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}

        {forgotMode === 'recovery_code' && (
          <form onSubmit={handleRedeemRecoveryCode} className="space-y-4 relative z-10">
            <div className="text-center mb-2">
              <h2 className="text-sm font-semibold text-[#3E3A35]">Emergency Recovery Code</h2>
              <p className="text-xs text-[#7A7369] mt-0.5">Redeem your single-use 24-character code to set a new password</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="admin@perennialsvisa.com"
                className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#E2B87C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">24-Character Recovery Code</label>
              <input
                type="text"
                required
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                className="w-full font-mono bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#E2B87C] transition-colors uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">New Password (min 10 characters)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 10 characters"
                  className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#E2B87C] transition-colors pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7369] hover:text-[#3E3A35]"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#E2B87C] transition-colors"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Reset Password with Code</span>
            </Button>

            <div className="pt-2 border-t border-[#E6DFD5] space-y-2 text-center">
              <button
                type="button"
                className="text-xs text-[#E2B87C] hover:underline flex items-center justify-center gap-1 w-full"
                onClick={() => {
                  setForgotMode('email_reset');
                  setError('');
                  setSuccess('');
                }}
              >
                <span>Back to Email Reset</span>
              </button>
              <button
                type="button"
                className="text-xs text-[#7A7369] hover:text-[#3E3A35] flex items-center justify-center gap-1 w-full pt-1"
                onClick={() => {
                  setForgotMode('none');
                  setError('');
                  setSuccess('');
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
