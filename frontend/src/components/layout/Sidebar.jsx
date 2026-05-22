import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  GitBranch, 
  BarChart3, 
  Sparkles, 
  Users, 
  Bell, 
  Settings,
  ChevronLeft,
  Menu,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Bids', path: '/bids' },
  { icon: GitBranch, label: 'Workflow', path: '/workflow' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'AI Insights', path: '/ai-insights' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: ShieldAlert, label: 'Audit Logs', path: '/audit-logs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isMobile }) => {
  const { hasPermission } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    if (item.path === '/analytics') return hasPermission('access-analytics');
    if (item.path === '/audit-logs') return hasPermission('manage-users');
    if (item.path === '/settings') return hasPermission('access-settings');
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? 280 : (isCollapsed ? 80 : 280),
          x: isMobile ? (isMobileOpen ? 0 : -280) : 0
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className={`fixed left-0 top-0 h-screen border-r border-slate-200 dark:border-slate-800/40 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl transition-all duration-300 ${isMobile ? 'z-50' : 'z-40'}`}
      >
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Zap className="h-5.5 w-5.5 text-white" />
            </div>
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Bid<span className="text-blue-500">AI</span>
                  <span className="ml-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wide">SaaS</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-1.5">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={({ isActive }) => `
                  relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.05)] font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </nav>

          {/* Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-auto flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#090d1f]/50 p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-sm"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
