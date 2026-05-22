import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  AlertOctagon, 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle2, 
  RefreshCw, 
  Brain, 
  Zap 
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import api from '../../api/axios';

const insights = [
  {
    id: 1,
    title: '3 bids are at high risk',
    description: 'Proposals missing crucial AI-validated competitor price points. Immediate pricing review suggested.',
    confidence: 94,
    trend: 'critical',
    icon: AlertOctagon,
    color: 'from-rose-500/10 to-orange-500/5 dark:from-rose-500/20 dark:to-orange-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse'
  },
  {
    id: 2,
    title: 'Revenue may increase 12%',
    description: 'Projected pipeline valuation expansion based on ongoing Q2 Solar Grid tender win ratios.',
    confidence: 88,
    trend: 'up',
    icon: TrendingUp,
    color: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 3,
    title: '2 projects delayed',
    description: 'Workflow stages in negotiation phase are 4 days past estimated proposal submission deadline.',
    confidence: 92,
    trend: 'warning',
    icon: Clock,
    color: 'from-amber-500/10 to-yellow-500/5 dark:from-amber-500/20 dark:to-yellow-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
  },
  {
    id: 4,
    title: 'Team Alpha performing best',
    description: 'Sarah Chen and Marcus Miller achieved 91% Win Ratios across critical healthcare proposals.',
    confidence: 95,
    trend: 'best',
    icon: Award,
    color: 'from-violet-500/10 to-blue-500/5 dark:from-violet-500/20 dark:to-blue-500/10 border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400'
  },
  {
    id: 5,
    title: 'Negotiation success rate improving',
    description: 'Closed-won conversion in Negotiation columns advanced +8.4% compared to previous monthly averages.',
    confidence: 85,
    trend: 'up',
    icon: CheckCircle2,
    color: 'from-blue-500/10 to-cyan-500/5 dark:from-blue-500/20 dark:to-cyan-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const SummarySkeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="space-y-2">
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-3 w-2/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-2 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
  </div>
);

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Parse markdown into custom premium formatted elements
  const parseInlineStyles = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="text-slate-900 dark:text-blue-400 font-extrabold">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  const parseMarkdownToJSX = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 1. Process Section Headers
      if (line.startsWith('###') || line.startsWith('####')) {
        const headerText = line.replace(/^[#\s]+/, '');
        return (
          <h4 key={index} className="text-xs font-black text-slate-800 dark:text-white mt-5 mb-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-1.5 uppercase tracking-wider shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {headerText}
          </h4>
        );
      }
      
      // 2. Process list items
      if (line.startsWith('-') || line.startsWith('*')) {
        const itemText = line.replace(/^[-\*\s]+/, '');
        return (
          <div key={index} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed pl-1">
            <span className="text-blue-500 dark:text-blue-400 font-bold shrink-0 mt-0.5">•</span>
            <span>{parseInlineStyles(itemText)}</span>
          </div>
        );
      }

      // 3. Process normal paragraphs
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-xs text-slate-650 dark:text-slate-350 my-2 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Fetch AI project summary report from MERN backend
  const fetchAISummary = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const { data } = await api.get('/ai/project-summary');
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to query backend AI summary:', err);
      setSummary('**Configuration Notification:**\n\nGoogle Gemini API Key is missing or invalid. Please check your Express backend `.env` variables under `GEMINI_API_KEY` to unlock state-of-the-art predictive forecasting insights.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAISummary();
  }, [fetchAISummary]);

  return (
    <GlassCard 
      hoverEffect={false} 
      className="flex flex-col p-6 min-h-[460px] max-h-[460px] relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-2xl"
    >
      {/* Background Ambient Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-blue-500/30 text-blue-500 dark:text-blue-400">
            <Brain className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <SectionTitle 
            title="AI Brain Insights" 
            subtitle="Automated portfolio forecasting and risk analysis." 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest shrink-0">
            <Zap className="h-2 w-2 mr-0.5 inline animate-bounce" /> Generated by AI
          </span>
          {activeTab === 'summary' && (
            <button
              onClick={() => fetchAISummary(false)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh AI Insights"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Dual Tab Headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 gap-4 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-1.5 transition-all relative cursor-pointer ${
            activeTab === 'summary' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          🔮 Live Portfolio Summary
          {activeTab === 'summary' && (
            <motion.div 
              layoutId="activeTabUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-1.5 transition-all relative cursor-pointer ${
            activeTab === 'metrics' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          🎯 Predictive Risk Ratios
          {activeTab === 'metrics' && (
            <motion.div 
              layoutId="activeTabUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full"
            />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' ? (
            <motion.div
              key="summary-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {loading ? (
                <SummarySkeleton />
              ) : (
                <div className="prose prose-invert max-w-none">
                  {parseMarkdownToJSX(summary)}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="metrics-tab"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {insights.map((ins) => (
                <motion.div
                  key={ins.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  className={`rounded-2xl border bg-gradient-to-r p-3.5 flex gap-3.5 relative overflow-hidden transition-all duration-300 ${ins.color}`}
                >
                  <div className="absolute inset-0 bg-white/[0.01] -z-10" />
                  <div className="shrink-0 flex items-center">
                    <ins.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black tracking-tight text-slate-800 dark:text-white">{ins.title}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Confidence:</span>
                        <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">{ins.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300/80 mt-1 leading-relaxed">
                      {ins.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default AIInsights;
