import React, { useEffect, useState } from 'react';
import {
  CheckCircle, AlertCircle, Clock, Server, Database, Bot, RefreshCw,
  Search, FileText, ArrowRight, ShieldCheck, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type SystemStatus = {
  status: 'operational' | 'degraded' | 'outage';
  services: {
    server: 'operational' | 'degraded' | 'outage';
    database: 'operational' | 'degraded' | 'outage';
    ai_proxy: 'operational' | 'degraded' | 'outage';
  };
  latencies?: {
    server?: number;
    database?: number;
    ai_proxy?: number;
  };
  timestamp: string;
};

type StatusCheckDoc = {
  status: 'operational' | 'degraded' | 'outage';
  timestamp: string;
};

type AppStatusLookupResult = {
  referenceId: string;
  firstName: string;
  planName: string;
  status: string;
};

export default function Status() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentChecks, setRecentChecks] = useState<StatusCheckDoc[]>([]);
  const [uptimePercent, setUptimePercent] = useState<number>(100);

  // Application Status Lookup
  const [appRefInput, setAppRefInput] = useState('');
  const [appLookupLoading, setAppLookupLoading] = useState(false);
  const [appLookupResult, setAppLookupResult] = useState<AppStatusLookupResult | null>(null);
  const [appLookupError, setAppLookupError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({
          status: 'degraded',
          services: { server: 'operational', database: 'degraded', ai_proxy: 'degraded' },
          timestamp: new Date().toISOString()
        });
      }
    } catch {
      setStatus({
        status: 'outage',
        services: { server: 'outage', database: 'outage', ai_proxy: 'outage' },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUptimeHistory = async () => {
    try {
      const q = query(collection(db, 'statusChecks'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docs = snap.docs.map(d => d.data() as StatusCheckDoc);
        setRecentChecks(docs);

        const operationalCount = docs.filter(c => c.status === 'operational').length;
        const rate = Math.round((operationalCount / docs.length) * 100);
        setUptimePercent(rate);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchUptimeHistory();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLookupApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appRefInput.trim()) return;

    setAppLookupLoading(true);
    setAppLookupError('');
    setAppLookupResult(null);

    try {
      const res = await fetch(`/api/application-status?ref=${encodeURIComponent(appRefInput.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setAppLookupError(data.error || 'No application record found for this reference ID.');
      } else {
        setAppLookupResult(data);
      }
    } catch (err: any) {
      setAppLookupError(err.message || 'Failed to check status. Please try again.');
    } finally {
      setAppLookupLoading(false);
    }
  };

  const overall = status?.status || 'operational';

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F4] border border-[#E2B87C]/40 rounded-md text-[#E2B87C] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>INFRASTRUCTURE & TRACKING</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#3E3A35] mb-4">System Status</h1>
          <p className="text-[#7A7369] max-w-xl mx-auto">
            Live uptime, platform latency, and official visa application tracking.
          </p>
        </div>

        {/* Overall Status Banner */}
        <div className={cn(
          "rounded-3xl p-8 mb-8 border flex items-center justify-between",
          overall === 'operational'
            ? "bg-green-500/10 border-green-500/20"
            : overall === 'degraded'
            ? "bg-yellow-500/10 border-yellow-500/20"
            : "bg-red-500/10 border-red-500/20"
        )}>
          <div className="flex items-center gap-4">
            {overall === 'operational' ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : overall === 'degraded' ? (
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <h2 className="text-xl font-bold text-[#3E3A35]">
                {overall === 'operational'
                  ? 'All Systems Operational'
                  : overall === 'degraded'
                  ? 'Partial Service Degradation'
                  : 'Major System Outage'}
              </h2>
              <p className="text-[#7A7369]/70 text-xs mt-1">
                Last updated: {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { fetchHealth(); fetchUptimeHistory(); }}
            disabled={loading}
            title="Refresh Status"
            className="p-3 bg-[#FCFBF8] border border-[#D9CFBE] rounded-xl hover:border-[#E2B87C] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-[#E2B87C]", loading && "animate-spin")} />
          </button>
        </div>

        {/* 3 Real Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Backend Server"
            status={status?.services?.server || 'operational'}
            latency={status?.latencies?.server}
            icon={<Server className="w-5 h-5" />}
          />
          <StatusCard
            title="Database"
            status={status?.services?.database || (loading ? 'operational' : 'outage')}
            latency={status?.latencies?.database}
            icon={<Database className="w-5 h-5" />}
          />
          <StatusCard
            title="AI Assistant (Groq)"
            status={status?.services?.ai_proxy || (loading ? 'operational' : 'degraded')}
            latency={status?.latencies?.ai_proxy}
            icon={<Bot className="w-5 h-5" />}
          />
        </div>

        {/* 24-Hour Uptime Indicator */}
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#3E3A35]">24-Hour Uptime Metric</h3>
              <p className="text-xs text-[#7A7369]">Automated health checks recorded every 5 minutes</p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-green-600 font-mono">{uptimePercent}%</span>
              <p className="text-[11px] text-[#7A7369]">Uptime</p>
            </div>
          </div>

          <div className="grid grid-cols-24 gap-1 h-7 items-center bg-[#F7F5F0] p-1 rounded-lg border border-[#E6DFD5]">
            {Array.from({ length: 24 }).map((_, idx) => {
              const check = recentChecks[idx];
              const isOk = !check || check.status === 'operational';
              return (
                <div
                  key={idx}
                  title={`Hour ${24 - idx}: ${isOk ? 'Operational' : 'Degraded'}`}
                  className={cn(
                    "h-full rounded-sm transition-all",
                    isOk ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-[#7A7369]/70 mt-2 font-mono">
            <span>24 hours ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Public Application Tracker (Single Source of Truth via /api/application-status) */}
        <div className="bg-[#FAF8F4] border border-[#E2B87C]/50 rounded-3xl p-8 shadow-sm">
          <div className="max-w-xl mx-auto text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#3E3A35] mb-2">Track Your Visa Application</h2>
            <p className="text-xs text-[#7A7369]">
              Enter your reference number (e.g. <code className="bg-[#FCFBF8] px-1 py-0.5 border rounded text-[#3E3A35]">APP-123456</code>) to view your verified live status.
            </p>
          </div>

          <form onSubmit={handleLookupApp} className="max-w-lg mx-auto flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7369]" />
              <input
                type="text"
                required
                value={appRefInput}
                onChange={(e) => setAppRefInput(e.target.value.toUpperCase())}
                placeholder="APP-XXXXXX"
                className="w-full bg-white border border-[#D9CFBE] text-[#3E3A35] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider outline-none focus:border-[#E2B87C] uppercase"
              />
            </div>
            <Button type="submit" disabled={appLookupLoading} className="flex items-center gap-1.5 shrink-0">
              {appLookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Track</span>
            </Button>
          </form>

          {appLookupError && (
            <div className="max-w-lg mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs text-center">
              {appLookupError}
            </div>
          )}

          {appLookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto bg-white border border-[#E6DFD5] rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#7A7369] uppercase">Application Reference</span>
                  <h3 className="text-lg font-mono font-bold text-[#3E3A35]">{appLookupResult.referenceId}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E2B87C]/20 text-[#3E3A35] border border-[#E2B87C]/40">
                  {appLookupResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#7A7369] block mb-1">Applicant Name</span>
                  <span className="font-semibold text-[#3E3A35] text-sm">{appLookupResult.firstName}</span>
                </div>
                <div>
                  <span className="text-[#7A7369] block mb-1">Visa Category</span>
                  <span className="font-semibold text-[#3E3A35] text-sm">{appLookupResult.planName}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatusCard({
  title, status, latency, icon
}: {
  title: string;
  status: 'operational' | 'degraded' | 'outage';
  latency?: number;
  icon: React.ReactNode;
}) {
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
          "px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize",
          status === 'operational'
            ? "bg-green-500/10 text-green-500 border-green-500/20"
            : status === 'degraded'
            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {status}
        </span>
      </div>
      <h3 className="text-[#3E3A35] font-medium">{title}</h3>
      {latency !== undefined && latency > 0 && (
        <p className="text-[11px] text-[#7A7369]/70 font-mono mt-1">
          {latency} ms response
        </p>
      )}
    </motion.div>
  );
}
