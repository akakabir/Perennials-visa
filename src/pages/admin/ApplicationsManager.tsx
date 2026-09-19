import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Application, ApplicationStatus } from '../../types';
import { cn } from '../../lib/utils';
import { Search, Mail, Trash2, Link as LinkIcon, CheckCircle, Archive, AlertTriangle, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// [UI COMPONENT] ApplicationsManager - Renders the ApplicationsManager view
export default function ApplicationsManager() {
  const { applications, updateApplication, deleteApplication, visaPlans, adminEmail, adminUsername } = useAppContext();
  const [search, setSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const navigate = useNavigate();

  const handleSendEmail = (appId: string) => navigate('/admin/emails', { state: { selectedApplicant: appId, recipientType: 'applicant' } });

  const activeApps = applications.filter(a => !a.archived);
  const archivedCount = applications.filter(a => a.archived).length;

  const filteredApps = activeApps.filter(a =>
    a.referenceId.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.phone && a.phone.includes(search))
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

  const handleArchive = async (app: Application) => {
    await updateApplication({
      ...app,
      archived: true,
      archivedAt: new Date().toISOString(),
      archivedBy: adminEmail || adminUsername || 'admin'
    });
    setDeleteTarget(null);
  };

  const handlePermanentDelete = async (app: Application) => {
    await deleteApplication(app.id);
    setDeleteTarget(null);
  };

  const copyPaymentLink = (referenceId: string) => {
    const link = `${window.location.origin}/pay?ref=${referenceId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(referenceId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E3A35]">Applications</h1>
          <p className="text-xs text-[#7A7369] mt-0.5">Manage active applicant status, notes, and records</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/admin/application-history"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FCFBF8] border border-[#E6DFD5] hover:border-[#E2B87C] rounded-xl text-xs font-medium text-[#7A7369] hover:text-[#3E3A35] transition-colors"
          >
            <Archive className="w-4 h-4 text-[#E2B87C]" />
            <span>Application History</span>
            {archivedCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E2B87C]/20 text-[#3E3A35] rounded-full">
                {archivedCount}
              </span>
            )}
          </Link>
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search reference or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl text-sm outline-none focus:border-[#E2B87C] w-full sm:w-64"
            />
            <Search className="w-4 h-4 text-[#7A7369] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
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
                          app.status === 'Approved' ? "text-green-600 border-green-500/30" :
                          app.status === 'Rejected' ? "text-red-600 border-red-500/30" :
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
                        <button onClick={() => setDeleteTarget(app)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete or Archive Application">
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

      {/* Functional Delete / Archive Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <AlertTriangle className="w-5 h-5" />
                <span>Delete Application</span>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-[#7A7369] hover:text-[#3E3A35] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-[#3E3A35]">
              <p>
                How would you like to handle application{' '}
                <span className="font-mono font-bold text-[#E2B87C]">{deleteTarget.referenceId}</span> for{' '}
                <span className="font-semibold">{deleteTarget.name}</span>?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-amber-700" /> Move to Application History (Recommended)
                </div>
                <p className="text-[11px] text-amber-800">
                  Hides the application from active views while preserving its record. You can restore it at any time.
                </p>
                <button
                  onClick={() => handleArchive(deleteTarget)}
                  className="w-full mt-2 py-2 px-3 bg-[#E2B87C] hover:bg-[#d4a86b] text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Move to Application History
                </button>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-red-900 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-red-700" /> Permanently Delete
                </div>
                <p className="text-[11px] text-red-800">
                  Irreversibly removes this application from the database immediately. Cannot be undone.
                </p>
                <button
                  onClick={() => handlePermanentDelete(deleteTarget)}
                  className="w-full mt-2 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Permanently Delete Application
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-[#7A7369] hover:text-[#3E3A35] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
