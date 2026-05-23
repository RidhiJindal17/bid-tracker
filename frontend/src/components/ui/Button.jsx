import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-[#2447A5] hover:bg-[#3259c7] text-white shadow-[0_4px_14px_rgba(36,71,165,0.22)] dark:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_6px_20px_rgba(36,71,165,0.32)] dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all",
    secondary: "bg-white dark:bg-slate-800 text-[#2447A5] dark:text-slate-200 hover:bg-[#EAF1FF]/60 dark:hover:bg-slate-700 border border-[#DCE3F1] dark:border-slate-700 shadow-sm",
    outline: "border border-[#DCE3F1] dark:border-slate-800 bg-transparent text-[#5B6B8A] dark:text-slate-350 hover:bg-[#EAF1FF]/40 dark:hover:bg-slate-900/40 hover:text-[#2447A5] dark:hover:text-slate-200 shadow-sm",
    ghost: "bg-transparent text-[#5B6B8A] dark:text-slate-400 hover:bg-[#EAF1FF]/30 dark:hover:bg-slate-800/40 hover:text-[#2447A5] dark:hover:text-slate-200",
    danger: "bg-[#DC2626] text-white hover:bg-red-500 shadow-sm hover:shadow-[0_4px_14px_rgba(220,38,38,0.25)] dark:bg-red-650 dark:hover:bg-red-500",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
