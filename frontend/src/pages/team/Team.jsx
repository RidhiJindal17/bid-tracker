import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Shield, 
  Activity, 
  TrendingUp, 
  Percent, 
  Briefcase, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  Users, 
  CheckCircle,
  BarChart2,
  Lock,
  Mail,
  User,
  Clock,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

import PageTransition from '../../components/ui/PageTransition';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import SectionTitle from '../../components/ui/SectionTitle';
import Loader from '../../components/ui/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ROLE_BADGES = {
  admin: { bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20', label: 'Admin' },
  sales: { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20', label: 'Sales' },
  manager: { bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20', label: 'Manager' },
  engineer: { bg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-750 dark:text-teal-400 border-teal-100 dark:border-teal-500/20', label: 'Engineer' },
  user: { bg: 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-500/20', label: 'User' }
};

const DEPT_COLORS = {
  Engineering: 'text-teal-600 dark:text-teal-400 font-semibold',
  Sales: 'text-amber-600 dark:text-amber-400 font-semibold',
  Management: 'text-indigo-600 dark:text-indigo-400 font-semibold',
  Product: 'text-purple-600 dark:text-purple-400 font-semibold',
  General: 'text-slate-600 dark:text-slate-400 font-semibold'
};

const Team = () => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form States
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'engineer', department: 'Engineering' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', department: '', status: '', completedTasks: 0, efficiency: 100 });

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch members (accessible to all authenticated users)
      try {
        const membersRes = await api.get('/users');
        if (membersRes.data.success) setMembers(membersRes.data.data);
      } catch (err) {
        console.error('Error fetching members:', err);
        toast.error('Failed to load team members.');
      }

      // Fetch performance (restricted to admin and manager)
      try {
        const perfRes = await api.get('/users/performance');
        if (perfRes.data.success) setPerformance(perfRes.data.data);
      } catch (err) {
        console.log('Performance metrics restricted for this user role.');
      }

      // Fetch activities (restricted to admin and manager)
      try {
        const actRes = await api.get('/users/activities');
        if (actRes.data.success) setActivities(actRes.data.data);
      } catch (err) {
        console.log('Activities history restricted for this user role.');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', addForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Member invited successfully.');
        setIsAddModalOpen(false);
        setAddForm({ name: '', email: '', role: 'engineer', department: 'Engineering' });
        fetchTeamData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite team member.');
    }
  };

  const handleEditOpen = (member) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      status: member.status,
      completedTasks: member.performanceMetrics?.completedTasks || 0,
      efficiency: member.performanceMetrics?.efficiency || 100
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/users/${selectedMember._id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        department: editForm.department,
        status: editForm.status,
        performanceMetrics: {
          completedTasks: editForm.completedTasks,
          efficiency: editForm.efficiency
        }
      });

      if (res.data.success) {
        toast.success('Team member profile updated.');
        setIsEditModalOpen(false);
        fetchTeamData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update team member.');
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the team?`)) return;

    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        toast.success('Team member removed.');
        fetchTeamData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member.');
    }
  };

  // Filtered members list
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || 
                          member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesDept = selectedDept === 'all' || member.department === selectedDept;
    return matchesSearch && matchesRole && matchesDept;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#12213A] dark:text-white tracking-tight">Team Hub</h1>
          <p className="text-[#5B6B8A] dark:text-slate-400 text-sm mt-1">Manage collaborators, monitor workflow velocity, and allocate pipeline resources.</p>
        </div>
        {hasPermission('manage-users') && (
          <Button 
            variant="primary" 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 self-start shadow-lg shadow-blue-500/10"
          >
            <UserPlus size={16} />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Analytics Overview Grid */}
      {performance && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Active Collaborators</span>
                <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{performance.totalMembers}</h3>
              </div>
              <div className="p-3 bg-[#EAF1FF] dark:bg-blue-500/10 rounded-xl text-[#2447A5] dark:text-blue-400">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs text-[#10b981] dark:text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
              <span>{performance.onlineMembers} Members Online</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Total Closed Bids</span>
                <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{performance.totalCompletedTasks}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs text-[#5B6B8A] dark:text-slate-400 font-medium">
              <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+14%</span> vs last month
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Won Revenue Margin</span>
                <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">${(performance.closedWonValuation / 1000000).toFixed(2)}M</h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-700 dark:text-purple-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs text-purple-700 dark:text-purple-400 font-bold">
              <span>Contribution efficiency tracking live</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B8A] dark:text-slate-400">Team Efficiency Index</span>
                <h3 className="text-3xl font-black text-[#12213A] dark:text-white mt-1">{performance.averageEfficiency}%</h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-700 dark:text-amber-400">
                <Percent size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full" 
                style={{ width: `${performance.averageEfficiency}%` }} 
              />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Grid: Member Panel & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Search, Filters, and Table Grid */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search members by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-[#5B6B8A]/60 dark:placeholder:text-slate-500 shadow-sm"
                />
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-slate-700 dark:text-slate-300 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="manager">Manager</option>
                    <option value="engineer">Engineer</option>
                  </select>
                  <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-slate-700 dark:text-slate-300 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="all">All Depts</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Management">Management</option>
                    <option value="Product">Product</option>
                  </select>
                  <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Members Modern Table */}
            <div className="overflow-x-auto rounded-xl border border-[#DCE3F1] dark:border-slate-800/40 shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#DCE3F1] dark:border-slate-800 bg-[#EAF1FF]/25 dark:bg-slate-900/30 text-xs font-bold text-[#5B6B8A] dark:text-slate-400">
                    <th className="p-4">Member Info</th>
                    <th className="p-4">Role & Status</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Assigned Bids</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-[#EAF1FF]/20 dark:hover:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800/30 last:border-b-0 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#EAF1FF] dark:bg-blue-600/20 border border-[#DCE3F1] dark:border-blue-500/15 flex items-center justify-center text-[#2447A5] dark:text-blue-400 font-bold text-sm">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#12213A] dark:text-white text-sm flex items-center gap-1.5">
                              {member.name}
                              {member.status === 'online' && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[#5B6B8A] dark:text-slate-400 text-xs font-mono">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_BADGES[member.role]?.bg || ROLE_BADGES.user.bg}`}>
                            {ROLE_BADGES[member.role]?.label || 'User'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs ${DEPT_COLORS[member.department] || 'text-slate-400'}`}>
                          {member.department}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#12213A] dark:text-slate-300 font-medium">
                          <Briefcase size={12} className="text-[#5B6B8A]" />
                          <span>{member.assignedCount} Bids</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {hasPermission('manage-users') ? (
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleEditOpen(member)}
                              className="p-1.5 rounded-lg bg-white dark:bg-slate-800/40 hover:bg-[#EAF1FF] dark:hover:bg-slate-800 text-[#5B6B8A] hover:text-[#2447A5] dark:text-slate-400 dark:hover:text-white border border-[#DCE3F1] dark:border-slate-800/60 transition-all cursor-pointer"
                              title="Edit Profile & Metrics"
                            >
                              <Edit size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteMember(member._id, member.name)}
                              className="p-1.5 rounded-lg bg-white dark:bg-slate-800/40 hover:bg-red-50 dark:hover:bg-red-500/10 text-[#5B6B8A] hover:text-red-650 dark:text-slate-400 dark:hover:text-red-400 border border-[#DCE3F1] dark:border-slate-800/60 hover:border-red-200 dark:hover:border-red-500/20 transition-all cursor-pointer"
                              title="Delete Collaborator"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                        No team collaborators match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Activity Timeline & Dept Stats */}
        <div className="space-y-6">
          {/* Department breakdown visually */}
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold text-[#12213A] dark:text-white mb-4">Workspace Balance</h4>
            <div className="space-y-3.5">
              {performance?.departmentMetrics?.map((dept, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#12213A] dark:text-slate-300">{dept.name}</span>
                    <span className="text-[#5B6B8A] dark:text-slate-400">{dept.count} Members ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        i === 0 ? 'from-teal-500 to-emerald-500' :
                        i === 1 ? 'from-amber-500 to-orange-500' :
                        i === 2 ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!performance?.departmentMetrics || performance.departmentMetrics.length === 0) && (
                <div className="text-xs text-slate-500 py-2">No active departments computed yet.</div>
              )}
            </div>
          </GlassCard>

          {/* Activity Timeline */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-blue-500" />
              <h4 className="text-sm font-bold text-[#12213A] dark:text-white">Collaboration Logs</h4>
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((act, i) => (
                  <li key={act.id || i}>
                    <div className="relative pb-8">
                      {i !== activities.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[#DCE3F1] dark:bg-slate-800" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-950 text-[#5B6B8A] dark:text-slate-400">
                            <Clock size={12} />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs text-[#5B6B8A] dark:text-slate-300">
                            <span className="font-bold text-[#12213A] dark:text-white">{act.userName}</span>{' '}
                            {act.action}
                          </p>
                          <p className="text-[10px] text-[#5B6B8A] dark:text-slate-500 font-medium mt-0.5">{act.details}</p>
                          <span className="text-[9px] font-semibold uppercase text-slate-600 block mt-1 tracking-wider">
                            {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {activities.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-4">No recent team operations logged.</div>
                )}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-slate-850 dark:hover:text-white bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-[#DCE3F1] dark:border-slate-800/40 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#EAF1FF] dark:bg-blue-500/10 rounded-xl text-[#2447A5] dark:text-blue-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#12213A] dark:text-white">Invite Collaborator</h3>
                  <p className="text-xs text-[#5B6B8A] dark:text-slate-400 mt-1">Send a registration link to onboard your pipeline contributor.</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={addForm.name}
                      onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-[#5B6B8A]/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. john@company.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-[#5B6B8A]/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Role Type</label>
                    <div className="relative">
                      <select 
                        value={addForm.role}
                        onChange={(e) => setAddForm({...addForm, role: e.target.value})}
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all appearance-none"
                      >
                        <option value="engineer">Engineer</option>
                        <option value="sales">Sales</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Shield size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
                    <div className="relative">
                      <select 
                        value={addForm.department}
                        onChange={(e) => setAddForm({...addForm, department: e.target.value})}
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all appearance-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Management">Management</option>
                        <option value="Product">Product</option>
                      </select>
                      <Briefcase size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                  >
                    Send Invitation Link
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile & Metrics Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-[#DCE3F1] dark:border-slate-800 rounded-2xl p-6 shadow-2xl z-10"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-slate-850 dark:hover:text-white bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-[#DCE3F1] dark:border-slate-800/40 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#EAF1FF] dark:bg-blue-500/10 rounded-xl text-[#2447A5] dark:text-blue-400">
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#12213A] dark:text-white">Adjust Collaborator Profile</h3>
                  <p className="text-xs text-[#5B6B8A] dark:text-slate-400">Modify assignments and update task completion metrics.</p>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Role Type</label>
                    <select 
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none"
                    >
                      <option value="engineer">Engineer</option>
                      <option value="sales">Sales</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
                    <select 
                      value={editForm.department}
                      onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Management">Management</option>
                      <option value="Product">Product</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Closed Bids</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editForm.completedTasks}
                      onChange={(e) => setEditForm({...editForm, completedTasks: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-[#12213A] dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5B6B8A] dark:text-slate-400 mb-1.5 uppercase tracking-wider">Efficiency %</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={editForm.efficiency}
                      onChange={(e) => setEditForm({...editForm, efficiency: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-[#DCE3F1] dark:border-slate-800 focus:border-[#2447A5]/50 dark:focus:border-blue-500/50 rounded-xl text-sm text-[#12213A] dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Team;
