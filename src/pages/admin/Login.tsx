import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe2, Plane, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAppContext } from '../../store/AppContext';

// [UI COMPONENT] Login - Renders the Login view
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showCodeSuccess, setShowCodeSuccess] = useState(false);
  const [forgotPasswordCode, setForgotPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setAdminLoggedIn, setAdminUsername, siteSettings, updateSiteSettings } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validAdmin = siteSettings?.admins?.find(
      (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.passwordHash === password
    );

    const actualAdmin1Password = siteSettings?.admin1Password || 'Perennial1@';

    if (validAdmin || (email.toLowerCase() === 'admin1' && password === actualAdmin1Password)) {
      setAdminLoggedIn(true);
      setAdminUsername(email.toLowerCase());
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }

    setLoading(false);
  };

  const handleForgotPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const correctCode = siteSettings?.forgotPasswordCode || 'didyouknowthatthiswebsitewasmadebyathirteenyearold';

    if (forgotPasswordCode === correctCode) {
      setShowCodeSuccess(true);
    } else {
      setError('Invalid code');
    }

    setLoading(false);
  };

  const handleContinueWithoutChanging = () => {
    setAdminLoggedIn(true);
    setAdminUsername('admin1');
    navigate('/admin');
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (siteSettings) {
      updateSiteSettings({ ...siteSettings, admin1Password: newPassword });
    }
    setAdminLoggedIn(true);
    setAdminUsername('admin1');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-md bg-[#FCFBF8] border border-[#E6DFD5] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2B87C]/5 rounded-bl-[100px] pointer-events-none" />
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4 bg-[#0C0C34] rounded-full p-1.5 shadow-lg">
            <img src="/logo.png" alt="Perennials Visa Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-xl font-bold text-[#3E3A35] tracking-widest uppercase">Admin Portal</h1>
        </div>

        {showForgotPassword ? (
          showCodeSuccess ? (
             <div className="space-y-5 relative z-10">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}
                <div className="text-center mb-4">
                  <p className="text-sm text-[#3E3A35] font-medium">Backup Password Verified</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1.5">New Password for admin1</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <Button onClick={handleChangePassword} className="w-full justify-center">
                    Change Password & Login
                  </Button>
                  <Button variant="outline" onClick={handleContinueWithoutChanging} className="w-full justify-center">
                    Continue without changing password
                  </Button>
                </div>
             </div>
          ) : (
            <form onSubmit={handleForgotPasswordLogin} className="space-y-5 relative z-10">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Backup password</label>
                <input
                  type="text"
                  required
                  value={forgotPasswordCode}
                  onChange={(e) => setForgotPasswordCode(e.target.value)}
                  className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors"
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full mt-4 flex justify-center gap-2">
                <Lock className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Submit Backup Password'}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  className="text-xs text-[#E2B87C] hover:underline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}
            
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Username or Email</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E2B87C] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="text-right mt-2">
                <button 
                  type="button"
                  className="text-xs text-[#E2B87C] hover:underline"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full mt-4 flex justify-center gap-2">
              <Lock className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
