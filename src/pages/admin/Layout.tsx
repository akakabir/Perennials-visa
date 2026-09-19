import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Globe2, Mail, LayoutDashboard, FileText, DollarSign, Users, MessageSquare, Settings, BarChart2, LogOut, Archive } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';

// [UI COMPONENT] AdminLayout - Renders the AdminLayout view
export default function AdminLayout() {
  const { adminLoggedIn, setAdminLoggedIn, applications } = useAppContext();
  const location = useLocation();

  if (!adminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    setAdminLoggedIn(false);
  };

  const archivedCount = applications.filter(a => a.archived).length;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Visa Plans', path: '/admin/plans', icon: FileText },
    { name: 'Pricing', path: '/admin/pricing', icon: DollarSign },
    { name: 'Applications', path: '/admin/applications', icon: Users },
    { name: 'Application History', path: '/admin/application-history', icon: Archive, badge: archivedCount },
    { name: 'Email Center', path: '/admin/emails', icon: Mail },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Process Steps', path: '/admin/process-steps', icon: Settings },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex relative z-10 font-sans">

      <aside className="w-64 bg-[#FCFBF8] border-r border-[#E6DFD5] flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6 border-b border-[#E6DFD5]">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[#0C0C34] rounded-full p-0.5 shadow-sm">
              <img src="/logo.png" alt="Admin Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold tracking-wider text-[#3E3A35] text-base">PV ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E2B87C]/10 text-[#E2B87C]"
                    : "text-[#7A7369] hover:bg-[#F0EEE9] hover:text-[#3E3A35]"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#E2B87C]/20 text-[#3E3A35] rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E6DFD5]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-[#FCFBF8]">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
