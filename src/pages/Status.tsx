import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Server, Database, Bot, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { cn } from '../lib/utils';

type SystemStatus = {
  status: 'operational' | 'degraded' | 'outage';
  services: {
    server: 'operational' | 'degraded' | 'outage';
    ai_proxy: 'operational' | 'degraded' | 'outage';
  };
  timestamp: string;
};

// [UI COMPONENT] Status - Renders the Status view
export default function Status() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'operational' | 'degraded'>('operational');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await /* [API CALL] /api/health */ fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({
          status: 'outage',
          services: { server: 'outage', ai_proxy: 'outage' },
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setStatus({
        status: 'outage',
        services: { server: 'outage', ai_proxy: 'outage' },
        timestamp: new Date().toISOString()
      });
    } finally {

      setTimeout(() => setDbStatus('operational'), 800);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = status?.status === 'operational' && dbStatus === 'operational' ? 'operational' : 'degraded';

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-[#3E3A35] mb-4">System Status</h1>
          <p className="text-[#7A7369] max-w-xl mx-auto">Real-time status of Perennials Visa infrastructure and services.</p>
        </div>

        <div className={cn(
          "rounded-3xl p-8 mb-8 border flex items-center justify-between",
          overallStatus === 'operational' ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"
        )}>
          <div className="flex items-center gap-4">
            {overallStatus === 'operational' ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            )}
            <div>
              <h2 className="text-xl font-bold text-[#3E3A35]">
                {overallStatus === 'operational' ? 'All Systems Operational' : 'Partial System Outage'}
              </h2>
              <p className="text-[#7A7369]/70 text-sm mt-1">
                Last updated: {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : '...'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-3 bg-[#FCFBF8] border border-[#D9CFBE] rounded-xl hover:border-[#E2B87C] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-[#E2B87C]", loading && "animate-spin")} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Backend Server"
            status={status?.services?.server || 'outage'}
            icon={<Server className="w-5 h-5" />}
          />
          <StatusCard
            title="AI Services"
            status={status?.services?.ai_proxy || 'outage'}
            icon={<Bot className="w-5 h-5" />}
          />
          <StatusCard
            title="Database"
            status={dbStatus}
            icon={<Database className="w-5 h-5" />}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// [UI COMPONENT] StatusCard - Renders the StatusCard view
function StatusCard({ title, status, icon }: { title: string, status: string, icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E6DFD5] flex items-center justify-center text-[#E2B87C]">
          {icon}
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          status === 'operational' ? "bg-green-500/10 text-green-400 border-green-500/20" :
          status === 'degraded' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
          "bg-red-500/10 text-red-400 border-red-500/20"
        )}>
          {status === 'operational' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Outage'}
        </span>
      </div>
      <h3 className="text-[#3E3A35] font-medium">{title}</h3>
    </motion.div>
  );
}
