import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  Briefcase, 
  FileUp, 
  User, 
  Cpu, 
  Lock, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  RefreshCw,
  Clock,
  Globe
} from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import auditLogService from '../../api/auditLogService';
import { toast } from 'react-hot-toast';

// Entity Icon Resolver
const getEntityIcon = (type) => {
  switch (type) {
    case 'Bid':
      return { icon: Briefcase, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' };
    case 'Upload':
      return { icon: FileUp, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' };
    case 'User':
      return { icon: User, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' };
    case 'AI':
      return { icon: Cpu, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' };
    case 'Auth':
      return { icon: Lock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' };
    default:
      return { icon: Settings, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20' };
  }
};

// Action Color Resolver (for tags)
const getActionColor = (action) => {
  const label = action.toLowerCase();
  if (label.includes('delete') || label.includes('fail') || label.includes('remove')) {
    return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
  }
  if (label.includes('create') || label.includes('register') || label.includes('upload') || label.includes('success')) {
    return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
  }
  if (label.includes('update') || label.includes('change') || label.includes('edit')) {
    return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
  }
  if (label.includes('ai') || label.includes('generate') || label.includes('chat')) {
    return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20';
  }
  return 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounced/Buffered Search & Filter Executer
  const fetchLogs = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        entityType: selectedEntity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      const res = await auditLogService.getLogs(params);
      if (res.success) {
        setLogs(res.logs);
        setTotalPages(res.pages);
        setTotalRecords(res.total);
      }
    } catch (err) {
      console.error('Failed to load transaction audit logs:', err);
      toast.error('Failed to fetch audit log trail.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedEntity, startDate, endDate, page]);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEntity('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    // Explicit fetch since state reset triggers are async
    setTimeout(() => fetchLogs(1), 50);
  };

  // Format relative/friendly timestamp
  const formatLogTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#12213A] dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-[#2447A5] dark:text-blue-500" /> Security Audit Logs
          </h1>
          <p className="text-[#5B6B8A] dark:text-slate-400 text-sm mt-1">Real-time enterprise compliance ledger, user access activity, and platform transaction history.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchLogs(page)} 
          disabled={loading}
          className="rounded-xl border-[#DCE3F1] dark:border-slate-800 hover:border-[#2447A5]/30 dark:hover:border-slate-700 font-semibold gap-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-[#2447A5] dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </Button>
      </div>

      {/* Sticky Glassmorphic Filter Panel */}
      <GlassCard className="p-5 border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f]/40 backdrop-blur-md sticky top-[72px] z-30 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Text Search */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold text-[#5B6B8A] dark:text-slate-400 uppercase tracking-wider">Search Details</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query actions, users, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 placeholder-[#5B6B8A]/50 dark:placeholder-slate-600 focus:border-[#2447A5] dark:focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Entity Select */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold text-[#5B6B8A] dark:text-slate-400 uppercase tracking-wider">Entity Class</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f] text-slate-700 dark:text-slate-300 focus:border-[#2447A5] dark:focus:border-blue-500 focus:outline-none transition-all shadow-sm"
              >
                <option value="">All Entities</option>
                <option value="Bid">Bids Pipeline (Bid)</option>
                <option value="Upload">File Uploads (Upload)</option>
                <option value="AI">Predictive AI (AI)</option>
                <option value="Auth">Security Auth (Auth)</option>
                <option value="User">User Accounts (User)</option>
                <option value="System">System Tasks (System)</option>
              </select>
            </div>

            {/* Date Bounded Range */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold text-[#5B6B8A] dark:text-slate-400 uppercase tracking-wider">Date Filters</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f] text-slate-700 dark:text-slate-300 focus:border-[#2447A5] dark:focus:border-blue-500 focus:outline-none shadow-sm"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f] text-slate-700 dark:text-slate-300 focus:border-[#2447A5] dark:focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="w-full py-2 text-xs font-bold text-white bg-[#2447A5] hover:bg-[#4F7DFF] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
              >
                <Filter className="h-3.5 w-3.5" /> Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-[#5B6B8A] dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-[#DCE3F1] dark:border-slate-800 hover:border-[#2447A5]/30 dark:hover:border-slate-700 bg-transparent rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Clear
              </button>
            </div>

          </div>
        </form>
      </GlassCard>

      {/* Main Ledger Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="h-10 w-10 text-[#2447A5] dark:text-blue-500 animate-spin" />
          <p className="text-[#5B6B8A] dark:text-slate-500 font-medium text-sm">Parsing security logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <GlassCard className="p-16 text-center border-[#DCE3F1] dark:border-slate-800/80 bg-transparent">
          <ShieldAlert className="h-12 w-12 text-slate-650 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No Logs Found</h3>
          <p className="text-[#5B6B8A] dark:text-slate-500 text-sm mt-1 max-w-md mx-auto">
            We couldn't locate any transaction entries matching your current search parameters. Try adjusting the query fields.
          </p>
          <Button 
            variant="outline" 
            onClick={handleResetFilters} 
            className="mt-6 rounded-xl border-[#DCE3F1] dark:border-slate-800 hover:border-[#2447A5]/30 dark:hover:border-slate-700 shadow-sm"
          >
            Clear Search Filters
          </Button>
        </GlassCard>
      ) : (
        <div className="relative space-y-6">
          {/* Vertical Timeline Rail */}
          <div className="absolute left-6 md:left-[2.75rem] top-2 bottom-2 w-0.5 bg-[#DCE3F1] dark:bg-slate-800/60" />

          {/* Log Entry Cards */}
          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => {
              const iconResolver = getEntityIcon(log.entityType);
              const Icon = iconResolver.icon;
              const actionClass = getActionColor(log.action);

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
                  className="relative pl-14 md:pl-20 group"
                >
                  {/* Timeline Badge Dot Indicator */}
                  <div className={`absolute left-3 md:left-8 top-1.5 h-7 w-7 rounded-full border flex items-center justify-center z-10 transition-colors duration-200 shadow-xl ${iconResolver.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Glassmorphic Log Card */}
                  <GlassCard className="p-4 border-[#DCE3F1] dark:border-slate-800/80 hover:border-[#2447A5]/30 dark:hover:border-slate-700 bg-white dark:bg-slate-950/20 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    
                    {/* Log details */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Action Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${actionClass}`}>
                          {log.action}
                        </span>
                        
                        {/* Operator label */}
                        <span className="text-xs text-[#5B6B8A] dark:text-slate-400 font-semibold flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-500" />
                          {log.user ? (
                            <span>{log.user.name} <span className="text-[10px] text-slate-550 font-medium">({log.user.role})</span></span>
                          ) : (
                            <span className="text-slate-550">System Task</span>
                          )}
                        </span>
                      </div>

                      {/* Details context description */}
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 leading-relaxed">
                        {log.details}
                      </p>
                    </div>

                    {/* Metadata column (timestamp + IP Address) */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 text-slate-500 text-xs border-t md:border-t-0 border-slate-800/40 pt-2.5 md:pt-0">
                      
                      {/* Localized Timestamp */}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-600" />
                        <span>{formatLogTime(log.timestamp)}</span>
                      </div>

                      {/* IP Address Label */}
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
                        <Globe className="h-3 w-3" />
                        <span>IP: {log.ipAddress || 'Internal'}</span>
                      </div>

                    </div>

                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[#DCE3F1] dark:border-slate-800/60 pl-14 md:pl-20">
              <span className="text-xs text-[#5B6B8A] dark:text-slate-550 font-semibold">
                Showing <span className="text-slate-800 dark:text-slate-300 font-bold">{logs.length}</span> of <span className="text-slate-800 dark:text-slate-300 font-bold">{totalRecords}</span> compliance entries
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg border-[#DCE3F1] dark:border-slate-800 hover:border-[#2447A5]/30 dark:hover:border-slate-700 cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 px-3">
                  Page <span className="text-slate-850 dark:text-white font-bold">{page}</span> of <span className="text-slate-500 font-medium">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-lg border-[#DCE3F1] dark:border-slate-800 hover:border-[#2447A5]/30 dark:hover:border-slate-700 cursor-pointer shadow-sm"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default AuditLogs;
