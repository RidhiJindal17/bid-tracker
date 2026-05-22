import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import GlassCard from './GlassCard';

const ChartSkeleton = ({ type = 'area' }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const baseColor = isDark ? '#1e293b' : '#e2e8f0';
  const highlightColor = isDark ? '#334155' : '#f1f5f9';

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <GlassCard hoverEffect={false} className="p-6 min-h-[400px] flex flex-col justify-between">
        {/* Header */}
        <div className="mb-6">
          <Skeleton width={180} height={20} className="rounded" />
          <Skeleton width={280} height={12} className="rounded mt-2" />
        </div>

        {/* Chart representation */}
        <div className="flex-1 flex items-end gap-3 w-full min-h-[220px] px-2 py-4">
          {type === 'pie' ? (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Pie Circle skeleton */}
              <div className="h-40 w-40 rounded-full border-[16px] border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center" />
              <div className="mt-8 flex justify-center gap-4 w-full">
                <Skeleton width={60} height={10} className="rounded" />
                <Skeleton width={60} height={10} className="rounded" />
                <Skeleton width={60} height={10} className="rounded" />
              </div>
            </div>
          ) : (
            // Bar/Area Chart representations
            <div className="flex-1 flex flex-col justify-between h-full w-full">
              <div className="flex-1 flex items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" style={{ height: '30%' }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" style={{ height: '65%' }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" style={{ height: '45%' }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" style={{ height: '80%' }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" style={{ height: '55%' }} />
              </div>
              <div className="flex justify-between mt-3 px-1">
                <Skeleton width={32} height={10} className="rounded" />
                <Skeleton width={32} height={10} className="rounded" />
                <Skeleton width={32} height={10} className="rounded" />
                <Skeleton width={32} height={10} className="rounded" />
                <Skeleton width={32} height={10} className="rounded" />
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </SkeletonTheme>
  );
};

export default ChartSkeleton;
