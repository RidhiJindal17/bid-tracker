import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import GlassCard from './GlassCard';

const SkeletonCard = ({ count = 1 }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const baseColor = isDark ? '#1e293b' : '#e2e8f0';
  const highlightColor = isDark ? '#334155' : '#f1f5f9';

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} hoverEffect={false} className="min-h-[140px] flex flex-col justify-between p-5">
          <div className="flex items-center justify-between w-full mb-4">
            <Skeleton width={80} height={12} className="rounded" />
            <Skeleton width={32} height={32} className="rounded-xl" />
          </div>
          <div>
            <Skeleton width={110} height={28} className="rounded" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-3 w-full">
            <Skeleton width={48} height={16} className="rounded" />
            <Skeleton width={60} height={12} className="rounded" />
          </div>
        </GlassCard>
      ))}
    </SkeletonTheme>
  );
};

export default SkeletonCard;
