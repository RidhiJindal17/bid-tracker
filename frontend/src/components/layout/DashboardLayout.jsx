import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '../dashboard/AIChatbot';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsCollapsed(true);
      } else {
        setIsMobile(false);
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-950 dark:text-slate-200 overflow-hidden transition-colors duration-300 relative">
      {/* Floating Glowing Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-500/5 dark:bg-violet-600/5 blur-[100px] pointer-events-none z-0" />
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isMobile={isMobile}
      />
      
      <motion.div
        animate={{ paddingLeft: isMobile ? 0 : (isCollapsed ? 80 : 280) }}
        className="flex w-full flex-col transition-all duration-300 min-h-screen"
      >
        <Navbar isMobile={isMobile} setIsMobileOpen={setIsMobileOpen} isMobileOpen={isMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          {/* Page content with animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>

      {/* Global Context-Aware AI Chatbot Assistant */}
      <AIChatbot />
    </div>
  );
};

export default DashboardLayout;
