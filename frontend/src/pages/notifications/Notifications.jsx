import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  CheckCheck, 
  Trash2, 
  Search, 
  Plus, 
  BellOff, 
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationCard from '../../components/notifications/NotificationCard';
import PageTransition from '../../components/ui/PageTransition';
import GlassCard from '../../components/ui/GlassCard';

const Notifications = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createMockNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read', 'bids'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredNotifications = notifications.filter((notification) => {
    // 1. Tab filter
    if (activeTab === 'unread' && notification.isRead) return false;
    if (activeTab === 'read' && !notification.isRead) return false;
    if (activeTab === 'bids' && notification.type !== 'bid_update') return false;

    // 2. Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getTabCount = (tabName) => {
    switch (tabName) {
      case 'unread':
        return notifications.filter(n => !n.isRead).length;
      case 'read':
        return notifications.filter(n => n.isRead).length;
      case 'bids':
        return notifications.filter(n => n.type === 'bid_update').length;
      case 'all':
      default:
        return notifications.length;
    }
  };

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto px-1 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="h-8 w-8 text-blue-500" /> Notification Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Track and manage your platform activities, compliance reports, and bid updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => createMockNotification()}
            className="flex items-center gap-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10 px-4 py-2 text-xs font-bold transition-all shadow-sm shadow-blue-500/5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Trigger Alert
          </motion.button>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-emerald-500" /> Mark all read
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid Dashboard Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-center border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-[#090d1f]/20">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Unread Inbox</span>
          <span className="text-2xl font-black text-blue-500 mt-1">{unreadCount}</span>
        </GlassCard>
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-center border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-[#090d1f]/20">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bid Updates</span>
          <span className="text-2xl font-black text-indigo-500 mt-1">{getTabCount('bids')}</span>
        </GlassCard>
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-center border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-[#090d1f]/20">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total History</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{notifications.length}</span>
        </GlassCard>
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-center border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-[#090d1f]/20">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Read Archive</span>
          <span className="text-2xl font-black text-emerald-500 mt-1">{getTabCount('read')}</span>
        </GlassCard>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/40 w-full md:w-auto overflow-x-auto">
          {['all', 'unread', 'read', 'bids'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all capitalize whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'bids' ? 'Bid Alerts' : tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab
                  ? 'bg-blue-500 text-white font-black'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold'
              }`}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Meta */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter notifications..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d1f]/40 py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-300 outline-none transition-all focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/5"
          />
        </div>
      </div>

      {/* Notifications Cards Container */}
      <div className="space-y-4">
        {loading ? (
          // Skeletons
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-[#090d1f]/20 backdrop-blur-xl animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/6 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[350px] flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 bg-transparent rounded-2xl p-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 mb-4">
              <BellOff className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {searchQuery ? 'No matches found' : 'Inbox is all clear'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              {searchQuery 
                ? `We couldn't find any notifications matching "${searchQuery}". Try refining your search query.`
                : `You don't have any notifications under the "${activeTab}" tab. Take a break, you're all caught up!`}
            </p>
            {!searchQuery && (
              <button
                onClick={() => createMockNotification()}
                className="mt-5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4.5 py-2 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Generate Test Notification
              </button>
            )}
          </motion.div>
        ) : (
          // Card List
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  compact={false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Notifications;
