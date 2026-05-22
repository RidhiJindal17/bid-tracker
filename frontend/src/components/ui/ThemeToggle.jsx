import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors relative overflow-hidden"
    >
      <motion.div
        initial={false}
        animate={{ y: isDark ? 0 : 30, opacity: isDark ? 1 : 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      >
        <Moon className="h-4.5 w-4.5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ y: !isDark ? 0 : -30, opacity: !isDark ? 1 : 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="absolute inset-0 m-auto flex items-center justify-center"
      >
        <Sun className="h-4.5 w-4.5 text-amber-500" />
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
