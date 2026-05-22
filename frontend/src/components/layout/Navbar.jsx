import React, { useState } from 'react';
import { Search, User, Sun, Settings, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ isMobile, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/40 bg-white/70 dark:bg-[#020617]/70 px-4 lg:px-8 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-3 w-full lg:w-96">
        {/* Mobile Toggle */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-xl border border-slate-800 bg-[#090d1f]/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        
        {/* Search Bar */}
        <div className="relative w-full max-w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Quick search (⌘K)..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-300 outline-none transition-all focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/5"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />

        <div className="h-6 w-px bg-slate-800/80 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#090d1f]/40 p-1.5 pr-2.5 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          >
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden sm:block">{user?.name || 'User'}</span>
          </button>
          
          <AnimatePresence>
            {showProfileMenu && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-2.5 w-52 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d1f]/95 p-2 shadow-xl dark:shadow-2xl backdrop-blur-xl"
                >
                  <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>

                  <Link 
                    to="/profile" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
                  >
                    <User className="h-4 w-4" /> Profile Details
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
                  >
                    <Settings className="h-4 w-4" /> Settings Panel
                  </Link>
                  
                  <div className="my-1.5 border-t border-slate-800/60" />
                  
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
