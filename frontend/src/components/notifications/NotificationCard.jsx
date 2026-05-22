import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  Trash2, 
  Check, 
  Clock 
} from 'lucide-react';

// Relative time utility
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 5) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  // Format as date for older entries
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotificationConfig = (type) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        iconClass: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/20',
        borderClass: 'border-l-emerald-500 dark:border-l-emerald-500',
        badge: 'Success'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconClass: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/20',
        borderClass: 'border-l-amber-500 dark:border-l-amber-500',
        badge: 'Warning'
      };
    case 'error':
      return {
        icon: XCircle,
        iconClass: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/10 border-rose-500/20',
        borderClass: 'border-l-rose-500 dark:border-l-rose-500',
        badge: 'Alert'
      };
    case 'bid_update':
      return {
        icon: FileSpreadsheet,
        iconClass: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20',
        borderClass: 'border-l-blue-500 dark:border-l-blue-500',
        badge: 'Bid Update'
      };
    case 'info':
    default:
      return {
        icon: Info,
        iconClass: 'text-slate-500 bg-slate-500/10 dark:bg-slate-500/10 border-slate-500/20',
        borderClass: 'border-l-slate-400 dark:border-l-slate-600',
        badge: 'System'
      };
  }
};

const NotificationCard = ({ 
  notification, 
  onMarkRead, 
  onDelete, 
  compact = false 
}) => {
  const { _id, title, message, type, isRead, createdAt } = notification;
  const config = getNotificationConfig(type);
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2, transition: { duration: 0.1 } }}
      className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#090d1f]/40 backdrop-blur-md transition-all duration-200 border-l-4 ${config.borderClass} ${
        !isRead 
          ? 'bg-slate-50/80 dark:bg-blue-500/[0.03] border-slate-300 dark:border-slate-700/80' 
          : 'opacity-85 hover:opacity-100'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div className="flex gap-3.5">
        {/* Icon & Unread status dot */}
        <div className="relative flex-shrink-0">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${config.iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          {!isRead && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`text-sm font-semibold truncate ${
              !isRead ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {title}
            </h4>
            {!compact && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800`}>
                {config.badge}
              </span>
            )}
          </div>
          
          <p className={`text-xs leading-relaxed ${
            compact ? 'line-clamp-2' : ''
          } ${!isRead ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            {message}
          </p>

          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Hover Controls */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 dark:bg-[#0b1026] rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-lg backdrop-blur-md">
        {!isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(_id);
            }}
            title="Mark as read"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(_id);
          }}
          title="Delete notification"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
