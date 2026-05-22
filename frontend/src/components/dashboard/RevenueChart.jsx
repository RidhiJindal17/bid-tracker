import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';

const revenueData = [
  { month: 'Jan', Revenue: 185000, Target: 150000 },
  { month: 'Feb', Revenue: 220000, Target: 175000 },
  { month: 'Mar', Revenue: 290000, Target: 200000 },
  { month: 'Apr', Revenue: 340000, Target: 250000 },
  { month: 'May', Revenue: 480000, Target: 300000 },
  { month: 'Jun', Revenue: 520000, Target: 350000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#090d1f]/95 p-3.5 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">
            Revenue: <span className="text-blue-400">${payload[0].value.toLocaleString()}</span>
          </p>
          {payload[1] && (
            <p className="text-xs font-semibold text-slate-400">
              Target: <span className="text-slate-300">${payload[1].value.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : revenueData;

  return (
    <GlassCard hoverEffect={false} className="min-h-[400px] flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle 
          title="Revenue Pipeline Progress" 
          subtitle="Monthly recurring & estimated pipeline revenue margins compared to quarterly targets." 
        />
      </div>

      <div className="flex-1 w-full min-h-[280px]">
        {mounted ? (
          <ResponsiveContainer width="99%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
              <Area 
                type="monotone" 
                dataKey="Target" 
                stroke="#6366f1" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorTarget)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] w-full bg-slate-950/20 animate-pulse rounded-xl border border-slate-800/40" />
        )}
      </div>
    </GlassCard>
  );
};

export default RevenueChart;
