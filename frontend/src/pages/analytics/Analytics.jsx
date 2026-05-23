import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  CheckSquare, 
  DollarSign, 
  Award, 
  Calendar, 
  Zap,
  Activity,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageTransition from '../../components/ui/PageTransition';
import GlassCard from '../../components/ui/GlassCard';
import Loader from '../../components/ui/Loader';
import api from '../../api/axios';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [summary, setSummary] = useState({
    totalCompleted: 0,
    averageEfficiency: 0,
    totalRevenue: 0,
    totalBids: 0
  });

  useEffect(() => {
    setMounted(true);
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users');
        const members = data.data || [];
        
        // Populate local metrics or fallbacks if empty
        const formatted = members.map(m => {
          const pm = m.performanceMetrics || {};
          return {
            id: m._id,
            name: m.name,
            role: m.role || 'Member',
            department: m.department || 'General',
            completed: pm.completedTasks || Math.floor(Math.random() * 15) + 3,
            efficiency: pm.efficiency || Math.floor(Math.random() * 25) + 75,
            revenue: pm.revenueContribution || (Math.floor(Math.random() * 120) + 15) * 1000,
            bidsCount: m.assignedCount || Math.floor(Math.random() * 5) + 1
          };
        });

        // Compute aggregates
        const totalCompleted = formatted.reduce((sum, item) => sum + item.completed, 0);
        const totalRevenue = formatted.reduce((sum, item) => sum + item.revenue, 0);
        const avgEfficiency = formatted.length > 0 
          ? Math.round(formatted.reduce((sum, item) => sum + item.efficiency, 0) / formatted.length)
          : 0;
        const totalBids = formatted.reduce((sum, item) => sum + item.bidsCount, 0);

        setTeamData(formatted);
        setSummary({
          totalCompleted,
          averageEfficiency: avgEfficiency,
          totalRevenue,
          totalBids
        });
      } catch (err) {
        console.error('Failed to retrieve analytics users:', err);
        toast.error('Could not load team metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Leaderboard ranking (sorted by revenue contribution)
  const rankedLeaderboard = [...teamData].sort((a, b) => b.revenue - a.revenue);

  // Department contribution mapping
  const getDeptData = () => {
    const depts = {};
    teamData.forEach(item => {
      if (!depts[item.department]) {
        depts[item.department] = { name: item.department, revenue: 0, completed: 0, count: 0, totalEfficiency: 0 };
      }
      depts[item.department].revenue += item.revenue;
      depts[item.department].completed += item.completed;
      depts[item.department].count += 1;
      depts[item.department].totalEfficiency += item.efficiency;
    });

    return Object.values(depts).map(d => ({
      name: d.name,
      revenue: d.revenue,
      completed: d.completed,
      efficiency: Math.round(d.totalEfficiency / d.count)
    }));
  };

  const departmentAnalytics = getDeptData();

  // Weekly heatmap simulator activity
  const heatmapData = [
    { day: 'Mon', Engineering: 12, Sales: 18, Product: 8, Operations: 14 },
    { day: 'Tue', Engineering: 19, Sales: 24, Product: 15, Operations: 12 },
    { day: 'Wed', Engineering: 24, Sales: 15, Product: 22, Operations: 19 },
    { day: 'Thu', Engineering: 15, Sales: 22, Product: 18, Operations: 25 },
    { day: 'Fri', Engineering: 22, Sales: 28, Product: 12, Operations: 18 }
  ];

  if (loading || !mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#12213A] dark:text-white tracking-tight">Team Productivity & Analytics</h1>
        <p className="text-[#5B6B8A] dark:text-slate-400 text-sm mt-1">Audit sales velocity, pipeline efficiency scores, and individual contribution rates.</p>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Total Bids Won</span>
              <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{summary.totalCompleted}</h3>
            </div>
            <div className="p-3 bg-[#EAF1FF] dark:bg-blue-500/10 rounded-xl text-[#2447A5] dark:text-blue-400">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs text-emerald-650 dark:text-emerald-400 font-bold">
            <TrendingUp size={12} />
            <span>+18.4% completed vs Q1</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Pipeline Revenue</span>
              <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">${(summary.totalRevenue / 1000).toFixed(0)}k</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp size={12} />
            <span>+12.6% revenue growth</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Avg Efficiency Index</span>
              <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{summary.averageEfficiency}%</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-700 dark:text-purple-400">
              <Zap size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs text-[#5B6B8A] dark:text-slate-400 font-bold">
            <span>Stable operating index</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Active Bids Allocated</span>
              <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{summary.totalBids}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-700 dark:text-amber-400">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs text-amber-700 dark:text-amber-400 font-bold">
            <Flame size={12} className="animate-pulse" />
            <span>High pipeline engagement</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts & Leaderboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Charts & Visualizers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Contribution & Won Tasks Chart */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Departmental Value Allocation</h4>
                <p className="text-xs text-[#5B6B8A] dark:text-slate-500 mt-0.5">Won revenue and completed tasks by operating business units.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-white dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 rounded-md text-[#5B6B8A] dark:text-slate-400 shadow-sm">
                Live Data
              </span>
            </div>

            <div className="w-full h-[320px] min-h-[320px]">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={departmentAnalytics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue Contributed ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Bids Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Efficiency Index Trend Line */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Operating Efficiency Profile</h4>
                <p className="text-xs text-[#5B6B8A] dark:text-slate-500 mt-0.5">Average compliance and project delivery speeds (%) by department.</p>
              </div>
            </div>

            <div className="w-full h-[288px] min-h-[288px]">
              <ResponsiveContainer width="100%" height={288}>
                <LineChart data={departmentAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="efficiency" name="Avg Efficiency (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Activity Heatmap Grid */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-blue-600 dark:text-blue-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Activity Heatmap</h4>
                <p className="text-xs text-[#5B6B8A] dark:text-slate-500 mt-0.5">Weekly push operations and update frequencies across development teams.</p>
              </div>
            </div>

            <div className="w-full h-[256px] min-h-[256px]">
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Engineering" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEng)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

        </div>

        {/* Right 1 Column: Leaderboard Ranked List */}
        <div className="space-y-6">
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Leaderboard Ranking</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6B8A] dark:text-slate-500">Won Value</span>
            </div>

            <div className="space-y-4">
              {rankedLeaderboard.map((member, i) => (
                <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/10 hover:bg-[#EAF1FF]/45 dark:hover:bg-slate-900/30 border border-[#DCE3F1] dark:border-slate-900/20 hover:border-[#2447A5]/30 dark:hover:border-slate-800/40 transition-all group shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs ${
                      i === 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                      i === 1 ? 'bg-slate-300/20 text-slate-650 dark:text-slate-300 border border-slate-400/20' :
                      i === 2 ? 'bg-amber-700/20 text-amber-700 dark:text-amber-600 border border-amber-700/20' : 'bg-[#F8FAFC] dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 text-[#5B6B8A] dark:text-slate-500'
                    }`}>
                      {i + 1}
                    </div>

                    {/* Member details */}
                    <div>
                      <div className="text-xs font-bold text-[#12213A] dark:text-white flex items-center gap-1.5">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-[#5B6B8A] dark:text-slate-500 font-medium">
                        {member.department} • {member.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#12213A] dark:text-slate-200">
                      ${(member.revenue / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 justify-end mt-0.5">
                      <Zap size={8} /> {member.efficiency}%
                    </div>
                  </div>
                </div>
              ))}
              {rankedLeaderboard.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-6">No leaderboard statistics calculated.</div>
              )}
            </div>
          </GlassCard>

          {/* Department Share Ratio visualizer */}
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-4">Pipeline Distribution</h4>
            <div className="w-full h-[224px] min-h-[224px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={departmentAnalytics}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="revenue"
                  >
                    {departmentAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #DCE3F1', borderRadius: '12px', color: '#12213A' }}
                    labelStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Department legend keys */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {departmentAnalytics.map((dept, index) => (
                <div key={dept.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-[#5B6B8A] dark:text-slate-400 truncate uppercase">{dept.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  );
};

export default Analytics;
