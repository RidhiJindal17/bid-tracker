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
    <header className="sticky top-4 z-30 flex h-16 w-[calc(100%-2rem)] items-center justify-between border border-[#DCE3F1] dark:border-slate-800/40 bg-white/80 dark:bg-[#020617]/80 px-4 lg:px-8 backdrop-blur-xl rounded-2xl mx-4 shadow-[0_4px_20px_rgba(36,71,165,0.03)] dark:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 w-full lg:w-96">
        {/* Mobile Toggle */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-xl border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f]/50 p-2 text-[#5B6B8A] dark:text-slate-400 hover:bg-[#EAF1FF]/40 dark:hover:bg-slate-800 hover:text-[#2447A5] dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        
        {/* Search Bar */}
        <div className="relative w-full max-w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6B8A]/80 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Quick search (⌘K)..."
            className="w-full rounded-xl border border-[#DCE3F1] dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 py-2 pl-10 pr-4 text-xs text-[#12213A] dark:text-slate-300 outline-none transition-all focus:border-[#2447A5]/50 focus:ring-2 focus:ring-[#2447A5]/5 placeholder-[#5B6B8A]/60"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />

        <div className="h-6 w-px bg-[#DCE3F1] dark:bg-slate-800/80 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl border border-[#DCE3F1] dark:border-slate-800 bg-slate-50 dark:bg-[#090d1f]/40 p-1.5 pr-2.5 text-[#12213A] dark:text-slate-300 transition-all hover:bg-[#EAF1FF]/40 dark:hover:bg-slate-850 cursor-pointer"
          >
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-[#2447A5] to-[#4F7DFF] text-xs font-bold text-white uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-[#12213A] dark:text-slate-300 hidden sm:block">{user?.name || 'User'}</span>
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
                  className="absolute right-0 top-full z-20 mt-2.5 w-52 rounded-2xl border border-[#DCE3F1] dark:border-slate-800 bg-white dark:bg-[#090d1f] p-2 shadow-[0_10px_40px_rgba(36,71,165,0.08)] dark:shadow-2xl backdrop-blur-xl"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850 mb-1">
                    <p className="text-[10px] font-bold text-[#5B6B8A] uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-bold text-[#12213A] dark:text-white truncate mt-0.5">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-[#5B6B8A] dark:text-slate-400 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>

                  <Link 
                    to="/profile" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#5B6B8A] dark:text-slate-400 hover:bg-[#EAF1FF]/50 dark:hover:bg-slate-800/60 hover:text-[#2447A5] dark:hover:text-slate-200 transition-colors"
                  >
                    <User className="h-4 w-4 text-[#2447A5] dark:text-blue-400" /> Profile Details
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#5B6B8A] dark:text-slate-400 hover:bg-[#EAF1FF]/50 dark:hover:bg-slate-800/60 hover:text-[#2447A5] dark:hover:text-slate-200 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[#2447A5] dark:text-blue-400" /> Settings Panel
                  </Link>
                  
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-850" />
                  
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold cursor-pointer"
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
