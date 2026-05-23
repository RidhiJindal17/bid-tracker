import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';

const teamData = [
  { name: 'Sarah Chen', Bids: 18, Revenue: 450000, ApprovalRate: 88 },
  { name: 'Marcus Miller', Bids: 14, Revenue: 320000, ApprovalRate: 78 },
  { name: 'Alex Rivera', Bids: 12, Revenue: 210000, ApprovalRate: 91 },
  { name: 'Jessica Taylor', Bids: 16, Revenue: 380000, ApprovalRate: 81 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#090d1f]/95 p-3.5 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400 font-medium">Bids Handled:</span>
            <span className="text-xs font-bold text-blue-400">{payload[0].value}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400 font-medium">Revenue:</span>
            <span className="text-xs font-bold text-emerald-400">${payload[1].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400 font-medium">Approval Rate:</span>
            <span className="text-xs font-bold text-violet-400">{payload[2].value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TeamPerformanceChart = ({ data }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : teamData;

  return (
    <GlassCard hoverEffect={false} className="lg:col-span-3 min-h-[400px] flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle 
          title="Team Capability & Win Performance" 
          subtitle="Direct comparison of total proposals processed, closed-won values, and baseline contract efficiency." 
        />
      </div>

      <div className="w-full h-[280px] min-h-[280px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingBottom: '10px' }}
              />
              <Bar yAxisId="left" dataKey="Bids" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar yAxisId="left" dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar yAxisId="right" dataKey="ApprovalRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] w-full bg-slate-950/20 animate-pulse rounded-xl border border-slate-800/40" />
        )}
      </div>
    </GlassCard>
  );
};

export default React.memo(TeamPerformanceChart);
