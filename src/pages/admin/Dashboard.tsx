import React from 'react';
import { Users, FileText, MessageSquare, Star, Globe2 } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { Link } from 'react-router-dom';

// [UI COMPONENT] Dashboard - Renders the Dashboard view
export default function Dashboard() {
  const { applications, visaPlans, reviews } = useAppContext();

  const activePlans = visaPlans.filter(p => p.status === 'active').length;
  const pendingApps = applications.filter(a => !['Approved', 'Rejected'].includes(a.status)).length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0';

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Processing', value: pendingApps, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Active Visa Plans', value: activePlans, icon: Globe2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Avg Review Rating', value: `${avgRating}/5`, icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3A35] mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-[#7A7369] text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-[#3E3A35]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#3E3A35]">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sm text-[#E2B87C] hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {applications.slice(-4).reverse().map(app => (
              <div key={app.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-[#FCFBF8] transition-colors border border-transparent hover:border-[#CACACB]/5">
                <div>
                  <p className="text-[#3E3A35] text-sm font-medium">{app.name}</p>
                  <p className="text-xs text-[#7A7369]/50">{app.referenceId}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-[#E2B87C]/10 text-[#E2B87C] rounded-full border border-[#E2B87C]/20">
                  {app.status}
                </span>
              </div>
            ))}
            {applications.length === 0 && <p className="text-sm text-[#7A7369]/50">No applications yet.</p>}
          </div>
        </div>

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#3E3A35]">Pending Reviews</h2>
            <Link to="/admin/reviews" className="text-sm text-[#E2B87C] hover:underline">Manage</Link>
          </div>
          <div className="space-y-4">
            {reviews.filter(r => r.status === 'pending').slice(0,4).map(review => (
              <div key={review.id} className="flex justify-between items-start p-3 rounded-xl hover:bg-[#FCFBF8] transition-colors border border-transparent hover:border-[#CACACB]/5">
                <div>
                  <div className="flex gap-1 mb-1">
                     {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#E2B87C] text-[#E2B87C]' : 'fill-[#CACACB]/20 text-transparent'}`} />
                    ))}
                  </div>
                  <p className="text-[#3E3A35] text-sm">"{review.comment.substring(0, 50)}..."</p>
                  <p className="text-xs text-[#7A7369]/50 mt-1">- {review.name}</p>
                </div>
              </div>
            ))}
            {pendingReviews === 0 && <p className="text-sm text-[#7A7369]/50">No pending reviews.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
