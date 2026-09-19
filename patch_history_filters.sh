cat << 'INNER' > src/pages/admin/ApplicationHistory.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { Search, Mail, RotateCcw, Trash2, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationHistory() {
  const { applications, updateApplication, deleteApplication, visaPlans, adminUsername } = useAppContext();
  const [search, setSearch] = useState('');
  
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const navigate = useNavigate();

  const handleSendEmail = (appId: string) => navigate('/admin/emails', { state: { selectedApplicant: appId, recipientType: 'applicant' } });

  const archivedApps = applications.filter(a => a.archived);
  
  const filteredApps = archivedApps.filter(a => {
    const matchesSearch = a.referenceId.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan ? a.planId === filterPlan : true;
    const matchesStatus = filterStatus ? a.status === filterStatus : true;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleRestore = (appId: string) => {
    if (window.confirm("Restore this application?\n\nIt will return to the active Applications page.")) {
      const app = applications.find(a => a.id === appId);
      if (app) {
        const { archived, archivedAt, archivedBy, ...rest } = app;
        updateApplication({
          ...rest,
          archived: false
        });
      }
    }
  };

  const handlePermanentDelete = (appId: string) => {
    if (window.confirm("Permanently delete this application?\n\nThis cannot be undone.")) {
      deleteApplication(appId);
    }
  };

  const statuses = ['Submitted', 'Under Review', 'Assessment', 'Payment Required', 'Payment Confirmed', 'Documents Requested', 'Processing', 'Approved', 'Rejected'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3E3A35]">Application History</h1>
      </div>

      <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search reference, name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6DFD5] rounded-xl text-sm outline-none focus:border-[#E2B87C]"
              />
              <Search className="w-4 h-4 text-[#7A7369] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <div className="flex gap-4">
                <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-xl px-3 py-2 text-sm outline-none">
                    <option value="">All Plans</option>
                    {visaPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-xl px-3 py-2 text-sm outline-none">
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
        
        <div className="overflow-x-auto border border-[#E6DFD5] rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-[#F0EEE9]/50 text-xs text-[#7A7369] border-b border-[#E6DFD5]">
              <tr>
                <th className="font-medium p-4 pb-3">Ref ID</th>
                <th className="font-medium p-4 pb-3">Applicant</th>
                <th className="font-medium p-4 pb-3">Plan</th>
                <th className="font-medium p-4 pb-3">Archived Details</th>
                <th className="font-medium p-4 pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CACACB]/5">
              {filteredApps.map(app => {
                const plan = visaPlans.find(p => p.id === app.planId);
                return (
                  <tr key={app.id} className="hover:bg-[#F7F5F0] transition-colors">
                    <td className="p-4 font-mono text-sm text-[#E2B87C]">{app.referenceId}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-[#3E3A35]">{app.name}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.email}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.status}</div>
                    </td>
                    <td className="p-4 text-sm text-[#7A7369]">{plan ? plan.name : 'Unknown Plan'}</td>
                    <td className="p-4 text-sm text-[#7A7369]">
                      <div>{app.archivedAt ? new Date(app.archivedAt).toLocaleDateString() : 'Unknown Date'}</div>
                      <div className="text-xs opacity-70">by {app.archivedBy || 'system'}</div>
                    </td>
                    <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleSendEmail(app.id)} className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9] rounded-lg transition-colors" title="View Emails">
                            <Mail className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleRestore(app.id)} className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restore">
                            <RotateCcw className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handlePermanentDelete(app.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Permanently Delete">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#7A7369]/50 text-sm">No archived applications found.</td>
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
