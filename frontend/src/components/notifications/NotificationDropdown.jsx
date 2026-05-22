import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Bell, BellOff, ArrowRight, PlusCircle } from 'lucide-react';
import NotificationCard from './NotificationCard';
import SkeletonTheme from 'react-loading-skeleton';

const NotificationDropdown = ({
  notifications,
  loading,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onCreateMock,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          {/* BackDrop for mobile devices */}
          <div className="fixed inset-0 z-40 bg-black/10 dark:bg-transparent sm:hidden" onClick={onClose} />

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 z-50 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d1f]/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
                
                {/* Seed button for testing */}
                <button
                  onClick={onCreateMock}
                  title="Generate test notification"
                  className="p-1 rounded text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-2 space-y-2">
              {loading ? (
                // Skeletons
                <div className="p-2 space-y-2.5 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                      <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-3 border border-slate-200 dark:border-slate-800">
                    <BellOff className="h-5 w-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">No new alerts</h5>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] mt-1">
                    When you receive updates about bids or actions, they will appear here.
                  </p>
                </div>
              ) : (
                // Notifications Card list
                <div className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkRead={onMarkRead}
                        onDelete={onDelete}
                        compact={true}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
              <Link
                to="/notifications"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 w-full py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Go to Inbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
