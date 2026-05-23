import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  isCurrency = false,
  isPercent = false,
  change, 
  trend = 'up', 
  trendData = [10, 15, 8, 20, 18, 30], 
  delay = 0 
}) => {
  // Convert number for rolling animation if it's numeric
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 1.5,
      delay: delay + 0.2,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      }
    });
    return () => controls.stop();
  }, [numericValue, delay]);

  // Formatter for display
  const formatValue = (val) => {
    if (isCurrency) {
      return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (isPercent) {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  // Sparkline coordinates calculator
  const width = 70;
  const height = 24;
  const minVal = Math.min(...trendData);
  const maxVal = Math.max(...trendData);
  const points = trendData
    .map((val, index) => {
      const x = (index / (trendData.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = trend === 'up' ? '#10b981' : '#f43f5e';
  const glowColor = trend === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-[#DCE3F1] dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#090d1f]/60 dark:to-[#030712]/80 p-5 shadow-[0_8px_30px_rgba(36,71,165,0.02)] dark:shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(36,71,165,0.05)] dark:hover:shadow-blue-500/5 group"
    >
      {/* Premium Border Gradient Highlight */}
      <div className="absolute inset-0 -z-10 rounded-2xl p-[1px] bg-gradient-to-b from-[#DCE3F1] to-transparent dark:from-slate-700/30 dark:to-slate-800/10 group-hover:from-[#4F7DFF]/30 dark:group-hover:from-blue-500/30 transition-all duration-300" />
      
      {/* Background soft color glow */}
      <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: strokeColor }} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#5B6B8A] dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl bg-[#EAF1FF] dark:bg-slate-900/60 border border-[#DCE3F1] dark:border-slate-800/80 text-[#2447A5] dark:text-slate-300 group-hover:border-[#4F7DFF]/40 transition-colors`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-black text-[#12213A] dark:text-white tracking-tight">
          {formatValue(displayValue)}
        </span>
      </div>

      {/* Sparkline & Percentage metrics */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-900/80 pt-3">
        <div className="flex items-center gap-1">
          {trend === 'up' ? (
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 dark:border-emerald-500/10 rounded-md px-1.5 py-0.5">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> {change}
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/5 border border-rose-500/15 dark:border-rose-500/10 rounded-md px-1.5 py-0.5">
              <ArrowDownRight className="h-3 w-3 mr-0.5" /> {change}
            </span>
          )}
        </div>

        {/* Dynamic Mini SVG Sparkline */}
        <div className="flex items-center" style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}>
          <svg width={width} height={height} className="overflow-visible">
            <motion.polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: delay + 0.3 }}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(StatsCard);
