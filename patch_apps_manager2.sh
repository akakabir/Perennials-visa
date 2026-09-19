cat << 'INNER' > src/pages/admin/ApplicationsManager.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { ApplicationStatus } from '../../types';
import { cn } from '../../lib/utils';
import { Search, Mail, Trash2, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationsManager() {
  const { applications, updateApplication, visaPlans, adminUsername } = useAppContext();
  const [search, setSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendEmail = (appId: string) => navigate('/admin/emails', { state: { selectedApplicant: appId, recipientType: 'applicant' } });

  const activeApps = applications.filter(a => !a.archived);
  const filteredApps = activeApps.filter(a =>
    a.referenceId.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const statuses: ApplicationStatus[] = ['Submitted', 'Under Review', 'Assessment', 'Payment Required', 'Payment Confirmed', 'Documents Requested', 'Processing', 'Approved', 'Rejected'];

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      updateApplication({ ...app, status: newStatus });
    }
  };

  const handleNoteChange = (appId: string, note: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      updateApplication({ ...app, adminNote: note });
    }
  };

  const handleDeleteClick = (appId: string) => {
    if (window.confirm("Delete this application?\n\nIt will be moved to Application History rather than permanently lost.")) {
      const app = applications.find(a => a.id === appId);
      if (app) {
        updateApplication({
          ...app,
          archived: true,
          archivedAt: new Date().toISOString(),
          archivedBy: adminUsername || 'admin'
        });
      }
    }
  };

  const copyPaymentLink = (referenceId: string) => {
    const link = `${window.location.origin}/status?ref=${referenceId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(referenceId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3E3A35]">Applications</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search reference or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl text-sm outline-none focus:border-[#E2B87C] w-64"
          />
          <Search className="w-4 h-4 text-[#7A7369] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F0EEE9]/50 text-xs text-[#7A7369] border-b border-[#E6DFD5]">
              <tr>
                <th className="font-medium p-4 pb-3">Ref ID</th>
                <th className="font-medium p-4 pb-3">Applicant</th>
                <th className="font-medium p-4 pb-3">Plan</th>
                <th className="font-medium p-4 pb-3">Status</th>
                <th className="font-medium p-4 pb-3">Notes (Visible to Applicant)</th>
                <th className="font-medium p-4 pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CACACB]/5">
              {filteredApps.map(app => {
                const plan = visaPlans.find(p => p.id === app.planId);
                return (
                  <tr key={app.id} className="hover:bg-[#F7F5F0] transition-colors">
                    <td className="p-4 font-mono text-sm text-[#E2B87C]">
                      {app.referenceId}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-[#3E3A35]">{app.name}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.email}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-[#7A7369]">{plan ? plan.name : 'Unknown Plan'}</td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={cn(
                          "bg-[#FCFBF8] border rounded-lg px-2 py-1 text-xs outline-none",
                          app.status === 'Approved' ? "text-green-400 border-green-500/30" :
                          app.status === 'Rejected' ? "text-red-400 border-red-500/30" :
                          "text-[#E2B87C] border-[#E2B87C]/30"
                        )}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={app.adminNote || ''}
                        onChange={(e) => handleNoteChange(app.id, e.target.value)}
                        placeholder="Add note for tracker..."
                        className="w-full bg-transparent border-b border-[#D9CFBE] text-[#3E3A35] px-0 py-1 text-xs outline-none focus:border-[#E2B87C] placeholder:text-[#7A7369]/30"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end items-center gap-1">
                        <button onClick={() => copyPaymentLink(app.referenceId)} className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9] rounded-lg transition-colors" title="Copy Status/Payment Link">
                          {copiedLink === app.referenceId ? <CheckCircle className="w-4 h-4 text-green-500"/> : <LinkIcon className="w-4 h-4"/>}
                        </button>
                        <button onClick={() => handleSendEmail(app.id)} className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9] rounded-lg transition-colors" title="Send Email">
                          <Mail className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDeleteClick(app.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Application">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7A7369]/50 text-sm">No active applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
INNER
