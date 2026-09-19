import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import { Save, Check, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { AdminAccount } from '../../types';

// [UI COMPONENT] SettingsManager - Renders the SettingsManager view
export default function SettingsManager() {
  const { siteSettings, updateSiteSettings, adminEmail } = useAppContext();
  const [formData, setFormData] = useState(siteSettings);
  const [saved, setSaved] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleAdminChange = (index: number, field: keyof AdminAccount, value: string) => {
    const newAdmins = [...(formData.admins || [])];
    newAdmins[index] = { ...newAdmins[index], [field]: value };
    setFormData({ ...formData, admins: newAdmins });
    setSaved(false);
  };

  const addAdmin = () => {
    const newAdmins: AdminAccount[] = [...(formData.admins || []), { name: '', email: '', passwordHash: '', role: 'admin', status: 'active' }];
    setFormData({ ...formData, admins: newAdmins });
    setSaved(false);
  };

  const removeAdmin = (index: number) => {
    if (formData.admins && formData.admins.length === 1) {
      alert("Cannot delete the last remaining admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;
    const newAdmins = (formData.admins || []).filter((_, i) => i !== index);
    setFormData({ ...formData, admins: newAdmins });
    setSaved(false);
  };


  const togglePassword = (index: number) => {
    setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSave = () => {
    updateSiteSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3E3A35]">Site Settings & Content</h1>
        <Button onClick={handleSave} className="flex items-center gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#3E3A35] border-b border-[#E6DFD5] pb-3 mb-4">Contact Information</h2>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Phone Number</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">WhatsApp</label>
            <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Instagram Handle</label>
            <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Office Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
        </div>

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
            <input name="heroHeadline" value={formData.heroHeadline} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Hero Subheading</label>
            <textarea name="heroSubheading" value={formData.heroSubheading} onChange={handleChange} rows={3} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">About / Footer Blurb</label>
            <textarea name="aboutBlurb" value={formData.aboutBlurb} onChange={handleChange} rows={3} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Footer Copyright Text</label>
            <input name="footerText" value={formData.footerText} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
          </div>
        </div>

        {adminEmail === "admin1" && (
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4 lg:col-span-2">
            <div className="border-b border-[#E6DFD5] pb-3 mb-4">
              <h2 className="text-lg font-semibold text-[#3E3A35]">Backup Password</h2>
              <p className="text-xs text-[#7A7369] mt-1">This backup password allows you to bypass the login screen if you forget your password.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Backup password</label>
              <input name="forgotPasswordCode" value={formData.forgotPasswordCode || ""} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
            </div>
          </div>
        )}

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-3 mb-4">
            <h2 className="text-lg font-semibold text-[#3E3A35]">Admin Accounts</h2>
            <Button size="sm" onClick={addAdmin} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Admin
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(formData.admins || []).map((admin, index) => (
              <div key={index} className="bg-[#FCFBF8] border border-[#D9CFBE] rounded-xl p-4 relative">
                <button
                  onClick={() => removeAdmin(index)}
                  className="absolute top-2 right-2 p-1.5 text-[#7A7369]/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Name</label>
                    <input
                      value={admin.name || ''}
                      onChange={(e) => handleAdminChange(index, 'name', e.target.value)}
                      className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"
                      placeholder="Admin Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Email</label>
                    <input
                      value={admin.email}
                      onChange={(e) => handleAdminChange(index, 'email', e.target.value)}
                      className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords[index] ? "text" : "password"}
                        value={admin.passwordHash}
                        onChange={(e) => handleAdminChange(index, 'passwordHash', e.target.value)}
                        className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C] pr-9"
                        placeholder="password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword(index)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7A7369]/60 hover:text-[#3E3A35]"
                      >
                        {showPasswords[index] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Role</label>
                      <select
                        value={admin.role || 'admin'}
                        onChange={(e) => handleAdminChange(index, 'role', e.target.value)}
                        className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Status</label>
                      <select
                        value={admin.status || 'active'}
                        onChange={(e) => handleAdminChange(index, 'status', e.target.value)}
                        className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!formData.admins || formData.admins.length === 0) && (
              <p className="text-[#7A7369]/60 text-sm">No custom admins added yet. The default "admin1" is active.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
