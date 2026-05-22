import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hoverEffect ? { y: -4, scale: 1.01, transition: { duration: 0.2 } } : {}}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-[#090d1f]/40 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:hover:shadow-blue-500/5 ${className}`}
      {...props}
    >
      {/* Dynamic gradient hover accent */}
      {hoverEffect && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/0 via-violet-500/0 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
