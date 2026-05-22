import React from 'react';

const SectionTitle = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
