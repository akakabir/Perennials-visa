import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Application } from '../../types';
import { Search, RotateCcw, Trash2, ArrowLeft, Archive, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// [UI COMPONENT] ApplicationHistory - Renders the Application History / Archive view
export default function ApplicationHistory() {
  const { applications, updateApplication, deleteApplication, visaPlans } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter archived applications
  const archivedApps = applications.filter(a => a.archived);

  const filteredApps = archivedApps.filter(app => {
    const matchesSearch =
      app.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.phone && app.phone.includes(search));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRestore = async (app: Application) => {
    if (window.confirm(`Restore application ${app.referenceId} back to Active Applications?`)) {
      await updateApplication({
        ...app,
        archived: false,
        archivedAt: undefined,
        archivedBy: undefined
      });
    }
  };

  const handlePermanentDelete = async (app: Application) => {
    if (
      window.confirm(
        `Permanently delete application ${app.referenceId} for ${app.name}?\n\nThis action cannot be undone.`
      )
    ) {
      await deleteApplication(app.id);
    }
  };

  const handleClearAllHistory = async () => {
    if (archivedApps.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete ALL ${archivedApps.length} archived applications?\n\nThis cannot be undone.`
      )
    ) {
      for (const app of archivedApps) {
        await deleteApplication(app.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/applications"
              className="text-[#7A7369] hover:text-[#3E3A35] flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Applications
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#3E3A35] flex items-center gap-2">
            <Archive className="w-6 h-6 text-[#E2B87C]" /> Application History & Archive
          </h1>
          <p className="text-xs text-[#7A7369] mt-1">
            Archived applications are safely stored here. You can restore them anytime or permanently delete them.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {archivedApps.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Empty History
            </button>
          )}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
                <th className="font-medium p-4 pb-3">Archived Info</th>
                <th className="font-medium p-4 pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CACACB]/5">
              {filteredApps.map(app => {
                const plan = visaPlans.find(p => p.id === app.planId);
                const archivedDateStr = app.archivedAt
                  ? new Date(app.archivedAt).toLocaleDateString()
                  : 'Archived';

                return (
                  <tr key={app.id} className="hover:bg-[#F7F5F0] transition-colors opacity-90">
                    <td className="p-4 font-mono text-sm text-[#7A7369]">
                      {app.referenceId}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-[#3E3A35]">{app.name}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.email}</div>
                      <div className="text-xs text-[#7A7369]/60">{app.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-[#7A7369]">{plan ? plan.name : 'Unknown Plan'}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-lg bg-gray-100 text-[#7A7369] border border-gray-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#7A7369]">
                      <div>{archivedDateStr}</div>
                      {app.archivedBy && (
                        <div className="text-[10px] text-[#7A7369]/60">by {app.archivedBy}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleRestore(app)}
                          className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                          title="Restore to Active Applications"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(app)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Permanently Delete (Cannot be undone)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#7A7369]/60 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive className="w-8 h-8 text-[#CACACB]" />
                      <p className="font-medium text-[#3E3A35]">No archived applications found</p>
                      <p className="text-xs text-[#7A7369]">
                        When applications are deleted from the Applications tab, they will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
