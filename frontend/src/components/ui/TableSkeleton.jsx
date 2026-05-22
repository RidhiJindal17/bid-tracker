import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import GlassCard from './GlassCard';

const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const baseColor = isDark ? '#1e293b' : '#e2e8f0';
  const highlightColor = isDark ? '#334155' : '#f1f5f9';

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <GlassCard hoverEffect={false} className="p-6 overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Skeleton width={200} height={36} className="rounded-xl" />
          <div className="flex gap-2">
            <Skeleton width={80} height={36} className="rounded-xl" />
            <Skeleton width={80} height={36} className="rounded-xl" />
          </div>
        </div>

        {/* Table Body representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="pb-3 pt-1 px-4">
                    <Skeleton width={80} height={12} className="rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="border-b border-slate-200/50 dark:border-slate-800/40">
                  {Array.from({ length: cols }).map((_, c) => (
                    <td key={c} className="py-4 px-4">
                      {c === 0 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton width={24} height={24} className="rounded-lg" />
                          <Skeleton width={120} height={14} className="rounded" />
                        </div>
                      ) : c === cols - 1 ? (
                        <div className="flex gap-2">
                          <Skeleton width={24} height={24} className="rounded" />
                          <Skeleton width={24} height={24} className="rounded" />
                        </div>
                      ) : (
                        <Skeleton width={70} height={12} className="rounded" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </SkeletonTheme>
  );
};

export default TableSkeleton;
