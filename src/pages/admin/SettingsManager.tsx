import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import {
  Save, Check, Plus, Trash2, Shield, KeyRound, Copy, CheckCheck,
  AlertCircle, CheckCircle, Loader2, RefreshCw, Mail, Eye, EyeOff
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';

export default function SettingsManager() {
  const {
    siteSettings, updateSiteSettings, admins, addAdmin, updateAdmin, deleteAdmin, adminUser
  } = useAppContext();

  const [formData, setFormData] = useState(siteSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security - Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Security - Change Email State
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Security - Recovery Code State
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  // Admin Management Modal / Form State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin' | 'manager'>('admin');
  const [adminCreating, setAdminCreating] = useState(false);
  const [adminModalError, setAdminModalError] = useState('');
  const [adminModalSuccess, setAdminModalSuccess] = useState('');

  useEffect(() => {
    if (!isDirty && siteSettings) {
      setFormData(siteSettings);
    }
  }, [siteSettings, isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(formData);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 1a. Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError('New password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setPasswordError('No authenticated user session found.');
      return;
    }

    setPasswordLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);

      setPasswordSuccess('Password updated successfully! Please keep it secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('Password is too weak. Please use a stronger combination.');
      } else {
        setPasswordError(err.message || 'Failed to update password.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // 1a Optional: Change Email Handler
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail.trim() || !emailPassword) {
      setEmailError('Please enter both the new email and your current password.');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setEmailError('No authenticated user session found.');
      return;
    }

    setEmailLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, emailPassword);
      await reauthenticateWithCredential(user, cred);
      await verifyBeforeUpdateEmail(user, newEmail.trim());

      setEmailSuccess(`Verification email sent to ${newEmail.trim()}. Please click the link to confirm.`);
      setNewEmail('');
      setEmailPassword('');
    } catch (err: any) {
      console.error('Email change error:', err);
      setEmailError(err.message || 'Failed to request email update.');
    } finally {
      setEmailLoading(false);
    }
  };

  // 1b. Recovery Code Generator
  const handleGenerateRecoveryCode = async () => {
    setGeneratingCode(true);
    setRecoveryError('');
    setRecoveryCode(null);
    setCopiedCode(false);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Missing auth credentials.');
      }

      const res = await fetch('/api/recovery-code/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate recovery code.');
      }

      setRecoveryCode(data.code);
    } catch (err: any) {
      console.error('Recovery code generation error:', err);
      setRecoveryError(err.message || 'Failed to generate code.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!recoveryCode) return;
    navigator.clipboard.writeText(recoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Add Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      setAdminModalError('Please provide an email address.');
      return;
    }

    setAdminCreating(true);
    setAdminModalError('');
    setAdminModalSuccess('');

    try {
      await addAdmin({
        email: newAdminEmail.trim(),
        name: newAdminName.trim() || undefined,
        role: newAdminRole
      });

      setAdminModalSuccess(`Admin account created for ${newAdminEmail}. A setup invite email has been sent.`);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('admin');
      setTimeout(() => {
        setShowAddAdminModal(false);
        setAdminModalSuccess('');
      }, 2000);
    } catch (err: any) {
      setAdminModalError(err.message || 'Failed to add admin.');
    } finally {
      setAdminCreating(false);
    }
  };

  const handleDeleteAdmin = async (admin: any) => {
    if (admin.uid === adminUser?.uid) {
      alert('You cannot delete your own admin account while signed in.');
      return;
    }
    if (admins.length <= 1) {
      alert('Cannot delete the last remaining admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete administrator "${admin.name || admin.email}"?`)) {
      return;
    }
    try {
      await deleteAdmin(admin.uid);
    } catch (err: any) {
      alert(err.message || 'Failed to delete admin.');
    }
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '' };
    let score = 0;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak (min 10 chars, uppercase, number, symbol)', color: 'text-red-500' };
    if (score === 2) return { score: 2, text: 'Medium', color: 'text-yellow-600' };
    if (score === 3) return { score: 3, text: 'Good', color: 'text-blue-600' };
    return { score: 4, text: 'Strong', color: 'text-green-600' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#3E3A35]">Site Settings & Security</h1>
          <p className="text-xs text-[#7A7369] mt-0.5">Manage global configuration, credentials, and administrator accounts</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#3E3A35] border-b border-[#E6DFD5] pb-3 mb-4">Contact Information</h2>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Phone Number</label>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">WhatsApp</label>
            <input name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Email</label>
            <input name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Instagram Handle</label>
            <input name="instagram" value={formData.instagram || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Office Address</label>
            <textarea name="address" value={formData.address || ''} onChange={handleChange} rows={2} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
        </div>

        {/* Website Copy */}
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#3E3A35] border-b border-[#E6DFD5] pb-3 mb-4">Website Copy</h2>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Website Name</label>
            <input name="siteName" value={formData.siteName || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Logo URL (relative or absolute)</label>
            <input name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Hero Headline</label>
            <input name="heroHeadline" value={formData.heroHeadline || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Hero Subheading</label>
            <textarea name="heroSubheading" value={formData.heroSubheading || ''} onChange={handleChange} rows={3} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">About / Footer Blurb</label>
            <textarea name="aboutBlurb" value={formData.aboutBlurb || ''} onChange={handleChange} rows={3} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Footer Copyright Text</label>
            <input name="footerText" value={formData.footerText || ''} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
        </div>
      </div>

      {/* SECTION 1: SECURITY (Password Change & Recovery Code) */}
      <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-6">
        <div className="border-b border-[#E6DFD5] pb-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#E2B87C]/10 text-[#E2B87C]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#3E3A35]">Security & Authentication</h2>
            <p className="text-xs text-[#7A7369]">Manage your account password, email, and single-use emergency recovery code</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Change Password Form */}
          <div className="border border-[#E6DFD5] rounded-xl p-5 bg-[#FAF8F4]/50 space-y-4">
            <h3 className="text-sm font-semibold text-[#3E3A35] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#E2B87C]" />
              <span>Change Password</span>
            </h3>

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7369]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[#7A7369]">New Password</label>
                  {strength.text && <span className={`text-[11px] font-medium ${strength.color}`}>{strength.text}</span>}
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 10 chars with mix of cases & numbers"
                    className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7369]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                />
              </div>

              <Button type="submit" disabled={passwordLoading} className="w-full mt-2 flex items-center justify-center gap-2">
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
              </Button>
            </form>
          </div>

          {/* Recovery Code Generator */}
          <div className="border border-[#E6DFD5] rounded-xl p-5 bg-[#FAF8F4]/50 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#3E3A35] flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#E2B87C]" />
                <span>Emergency Recovery Code</span>
              </h3>
              <p className="text-xs text-[#7A7369] leading-relaxed">
                If you ever lose access to your administrator email or forget your password, you can redeem a recovery code on the login page.
                Only a salted hash is stored securely on the server; the plain code is generated and displayed once.
              </p>
            </div>

            {recoveryError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoveryCode && (
              <div className="p-4 bg-white border-2 border-[#E2B87C] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#E2B87C] tracking-wider">Your New Recovery Code</span>
                  <span className="text-[11px] text-red-500 font-medium">Single use only</span>
                </div>
                <div className="font-mono text-base tracking-widest text-[#0C0C34] font-bold p-2.5 bg-[#FAF8F4] border border-[#D9CFBE] rounded-lg text-center select-all break-all">
                  {recoveryCode}
                </div>
                <Button size="sm" onClick={handleCopyCode} className="w-full flex items-center justify-center gap-2">
                  {copiedCode ? <CheckCheck className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Recovery Code'}</span>
                </Button>
                <p className="text-[11px] text-[#7A7369] text-center">
                  ⚠️ Save this code in a secure password manager. It will not be shown again.
                </p>
              </div>
            )}

            <div>
              <Button
                variant="outline"
                onClick={handleGenerateRecoveryCode}
                disabled={generatingCode}
                className="w-full flex items-center justify-center gap-2"
              >
                {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{generatingCode ? 'Generating Code...' : 'Generate New Recovery Code'}</span>
              </Button>
              <p className="text-[11px] text-[#7A7369]/70 text-center mt-2">
                Generating a new code immediately invalidates any previously issued code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADMINISTRATOR ACCOUNTS */}
      <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3E3A35]">Administrator Accounts</h2>
            <p className="text-xs text-[#7A7369]">All admins have dedicated documents in the Firestore <code className="text-[#E2B87C]">admins</code> collection. Passwords are never stored here.</p>
          </div>
          <Button size="sm" onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div key={admin.uid} className="bg-[#FCFBF8] border border-[#D9CFBE] rounded-xl p-4 relative space-y-3">
              <button
                onClick={() => handleDeleteAdmin(admin)}
                title="Delete Admin"
                className="absolute top-3 right-3 p-1.5 text-[#7A7369]/50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E2B87C]/15 flex items-center justify-center text-[#E2B87C] font-bold text-xs uppercase">
                  {(admin.name || admin.email || 'A').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#3E3A35]">{admin.name || 'Admin'}</h4>
                  <p className="text-xs text-[#7A7369]">{admin.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6DFD5]">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A7369] mb-1">Role</label>
                  <select
                    value={admin.role || 'admin'}
                    onChange={(e) => updateAdmin(admin.uid, { role: e.target.value })}
                    className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#E2B87C]"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#7A7369] mb-1">Status</label>
                  <select
                    value={admin.status || 'active'}
                    onChange={(e) => updateAdmin(admin.uid, { status: e.target.value as 'active' | 'inactive' })}
                    className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#E2B87C]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-[#7A7369]/60 font-mono truncate">
                UID: {admin.uid}
              </div>
            </div>
          ))}

          {admins.length === 0 && (
            <p className="text-[#7A7369]/60 text-sm col-span-3 py-4 text-center">
              No administrator accounts found. Create one using the button above.
            </p>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E6DFD5] pb-3">
              <h3 className="text-base font-bold text-[#3E3A35]">Add Administrator</h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-[#7A7369] hover:text-[#3E3A35] text-sm"
              >
                ✕
              </button>
            </div>

            {adminModalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs">
                {adminModalError}
              </div>
            )}
            {adminModalSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 text-xs">
                {adminModalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-white border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="sarah@perennialsvisa.com"
                  className="w-full bg-white border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full bg-white border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <p className="text-[11px] text-[#7A7369] leading-relaxed pt-1">
                Creating an admin provisionally registers them and automatically sends an email to complete their password setup.
              </p>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddAdminModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={adminCreating}>
                  {adminCreating ? 'Creating...' : 'Invite Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
