import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';

const pipelineData = [
  { name: 'New Enquiry', value: 12 },
  { name: 'Under Review', value: 15 },
  { name: 'Approved', value: 18 },
  { name: 'Rejected', value: 5 },
  { name: 'Negotiation', value: 8 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

const PipelineChart = ({ data }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : pipelineData;

  return (
    <GlassCard hoverEffect={false} className="flex flex-col p-6 min-h-[400px]">
      <div className="mb-6">
        <SectionTitle 
          title="Bid Pipeline Status" 
          subtitle="Distribution of proposal volume across core operational transaction stages." 
        />
      </div>

      <div className="w-full h-[220px] min-h-[220px] relative flex items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#090d1f" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#090d1f', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '9px', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] w-full bg-slate-950/20 animate-pulse rounded-xl border border-slate-800/40" />
        )}
      </div>
    </GlassCard>
  );
};

export default React.memo(PipelineChart);
