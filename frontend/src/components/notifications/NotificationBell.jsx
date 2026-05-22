import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createMockNotification,
  } = useNotifications();

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`relative rounded-xl border p-2 transition-all ${
          isOpen
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-500'
            : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </motion.button>

      <NotificationDropdown
        notifications={notifications}
        loading={loading}
        isOpen={isOpen}
        onClose={handleClose}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteNotification}
        onCreateMock={() => createMockNotification()}
      />
    </div>
  );
};

export default NotificationBell;
