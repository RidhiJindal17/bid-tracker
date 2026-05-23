import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Activity, 
  Cpu
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';

const initialLogs = [
  {
    id: 'log-1',
    code: 'SYS-101',
    title: 'AI Scanner Active',
    message: 'Active Gemini cognitive model initialized in backend.',
    type: 'info',
    timestamp: '14:15:02'
  },
  {
    id: 'log-2',
    code: 'DEAD-302',
    title: 'Deadline Conflict Detected',
    message: 'SLA closure overlap flagged on "Hospital Wing Expansion".',
    type: 'critical',
    timestamp: '14:15:20'
  },
  {
    id: 'log-3',
    code: 'VEL-104',
    title: 'Sprint Velocity Improved',
    message: 'Development throughput indices rose 14.8% after re-allocation.',
    type: 'success',
    timestamp: '14:16:04'
  },
  {
    id: 'log-4',
    code: 'SYS-WARN',
    title: 'Backend Workload Elevated',
    message: 'Express server memory consumption spikes to 82% during audit fetches.',
    type: 'warning',
    timestamp: '14:16:45'
  }
];

const alertTemplates = [
  {
    code: 'WIN-802',
    title: 'Win Probability Adjusting',
    message: 'Strategic pricing discount adjusts "Transit Solar" win odds to 78.4%.',
    type: 'success'
  },
  {
    code: 'DEAD-308',
    title: 'Target Close Reminder',
    message: 'GreenEnergy Solar closing in 12 hours. Scopes missing final drafts.',
    type: 'warning'
  },
  {
    code: 'WORK-204',
    title: 'Resource Workload Balanced',
    message: 'AI re-allocation re-assigned stagnant task load from Sarah Chen to Marcus Miller.',
    type: 'success'
  },
  {
    code: 'DB-SYNC',
    title: 'MongoDB Collection Synced',
    message: 'Proposal pipeline data aggregated. 4 active proposals index updated.',
    type: 'info'
  },
  {
    code: 'AI-AUDIT',
    title: 'Audit Control Completed',
    message: 'User activity audit log persistence successfully cached.',
    type: 'info'
  },
  {
    code: 'CRIT-404',
    title: 'SLA Warning Triggered',
    message: 'Smart City Solar Proposal exceeds default 18-day review delay threshold.',
    type: 'critical'
  }
];

const ActivityFeed = () => {
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random alert template
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newLog = {
        id: `log-${now.getTime()}`,
        code: template.code,
        title: template.title,
        message: template.message,
        type: template.type,
        timestamp: timeStr
      };

      setLogs((prev) => {
        // Keep a maximum of 6 latest terminal logs in the viewport
        const truncated = [newLog, ...prev];
        return truncated.slice(0, 6);
      });
    }, 6000); // Push a fresh AI-generated system alert event every 6 seconds!

    return () => clearInterval(interval);
  }, []);

  const typeThemes = {
    info: {
      text: 'text-cyan-500 dark:text-cyan-400',
      border: 'border-cyan-500/20 dark:border-cyan-500/10',
      bg: 'bg-cyan-500/5',
      glow: 'shadow-cyan-500/10',
      icon: Info
    },
    success: {
      text: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/10',
      bg: 'bg-emerald-500/5',
      glow: 'shadow-emerald-500/10',
      icon: CheckCircle2
    },
    warning: {
      text: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/10',
      bg: 'bg-amber-500/5',
      glow: 'shadow-amber-500/10',
      icon: AlertTriangle
    },
    critical: {
      text: 'text-rose-500 dark:text-rose-400',
      border: 'border-rose-500/20 dark:border-rose-500/10',
      bg: 'bg-rose-500/5',
      glow: 'shadow-rose-500/10',
      icon: Cpu
    }
  };

  return (
    <GlassCard hoverEffect={false} className="p-6 flex flex-col min-h-[440px] max-h-[440px] border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-10" />

      {/* Title */}
      <div className="flex items-center justify-between mb-4 shrink-0 border-b border-slate-200 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <SectionTitle 
            title="AI Monitor Activity Feed" 
            subtitle="Simulated diagnostic metrics and live telemetry alerts." 
          />
        </div>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
        </span>
      </div>

      {/* Futuristic Console Terminal Header */}
      <div className="bg-[#030612]/90 border border-slate-800 rounded-t-2xl p-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-550 dark:text-slate-500 font-bold ml-2 flex items-center gap-1.5 font-mono uppercase">
            <Terminal className="h-3 w-3" />
            gemini-ai@diagnostics:~$ _
          </span>
        </div>
        <span className="text-[8px] text-blue-500 font-black tracking-widest uppercase">Live Stream</span>
      </div>

      {/* Terminal Content Screen */}
      <div className="flex-1 bg-[#02050f] border-x border-b border-slate-850 rounded-b-2xl p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
        <div className="space-y-2.5 font-mono">
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const theme = typeThemes[log.type] || typeThemes.info;
              const Icon = theme.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, y: -5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className={`p-2.5 rounded-xl border ${theme.border} ${theme.bg} ${theme.glow} shadow-sm flex items-start justify-between gap-3`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`${theme.text} p-1 rounded-lg bg-[#000]/30 shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black tracking-widest ${theme.text}`}>[{log.code}]</span>
                        <span className="text-[10px] font-extrabold text-slate-100">{log.title}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-relaxed font-semibold">
                        {log.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-[8.5px] text-slate-550 dark:text-slate-500 shrink-0 pt-0.5">{log.timestamp}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
};

export default ActivityFeed;
