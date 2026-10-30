import React, { useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// [UI COMPONENT] Analytics - Renders the Analytics view
export default function Analytics() {
  const { applications, reviews, visaPlans } = useAppContext();

  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const conversionRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : 0;

  const statusData = useMemo(() => {
    if (applications.length === 0) return [];
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const COLORS = ['#E2B87C', '#8C8D8D', '#CACACB', '#E9EDF5', '#000000', '#0A0A31'];

  const planData = useMemo(() => {
    if (visaPlans.length === 0) return [];
    return visaPlans.map(plan => {
      const count = applications.filter(a => a.planId === plan.id).length;
      return {
        name: plan.name,
        applications: count
      };
    });
  }, [applications, visaPlans]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3A35] mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-5">
          <p className="text-xs text-[#7A7369] uppercase tracking-wider mb-2">Total Enquiries</p>
          <p className="text-3xl font-bold text-[#3E3A35]">{totalApps}</p>
        </div>
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-5">
          <p className="text-xs text-[#7A7369] uppercase tracking-wider mb-2">Approved Visas</p>
          <p className="text-3xl font-bold text-[#E2B87C]">{approvedApps}</p>
        </div>
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-5">
          <p className="text-xs text-[#7A7369] uppercase tracking-wider mb-2">Success Rate</p>
          <p className="text-3xl font-bold text-[#3E3A35]">{conversionRate}%</p>
        </div>
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-5">
          <p className="text-xs text-[#7A7369] uppercase tracking-wider mb-2">Avg Rating</p>
          <p className="text-3xl font-bold text-[#3E3A35]">{avgRating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#3E3A35] mb-6">Applications by Status</h2>
          {statusData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#CACACB', color: '#111827', borderRadius: '8px' }}
                      itemStyle={{ color: '#E2B87C' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-[#7A7369]">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#7A7369]/50">
              No application data available yet.
            </div>
          )}
        </div>

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#3E3A35] mb-6">Applications by Plan</h2>
          {planData.some(p => p.applications > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ fill: '#1E293B' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#CACACB', color: '#111827', borderRadius: '8px' }}
                  />
                  <Bar dataKey="applications" fill="#E2B87C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#7A7369]/50">
              No application data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
