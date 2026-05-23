import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User, Bell, Shield, Palette, Smartphone, Sparkles, RefreshCw, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

// Custom spring animated Toggle Switch
const Toggle = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
      checked ? 'bg-blue-600' : 'bg-slate-350 dark:bg-slate-800'
    }`}
  >
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`bg-white w-5 h-5 rounded-full shadow-md ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    bidUpdates: true,
    weeklyReport: false,
    aiInsights: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: true
  });

  const [selectedAccent, setSelectedAccent] = useState('blue');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserSettings = async () => {
      try {
        setIsFetching(true);
        const { data } = await api.get('/auth/me');
        if (isMounted) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching settings:', err);
          setError('Failed to load latest profile data');
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    fetchUserSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.put('/auth/updatedetails', formData);
      toast.success('Profile details updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      const message = err.response?.data?.message || 'Failed to update profile settings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      // Mock network verification/update
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'Profile', icon: User, label: 'Profile' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Devices', icon: Smartphone, label: 'Devices' },
  ];

  const pageVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
  };

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account credentials, notifications, and UI preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 md:col-span-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all relative cursor-pointer ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-[#EAF1FF]/40 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsNav"
                    className="absolute inset-0 bg-[#EAF1FF]/80 dark:bg-blue-600/10 border border-blue-500/25 dark:border-blue-500/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                <span className="text-sm relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="md:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Profile Section */}
              {activeTab === 'Profile' && (
                <Card className="relative overflow-hidden group">
                  <div className="absolute inset-0 -z-10 rounded-2xl p-[1px] bg-gradient-to-b from-[#DCE3F1] to-transparent dark:from-slate-700/30 dark:to-slate-800/10 group-hover:from-blue-500/20 transition-all duration-300" />
                  <h2 className="text-xl font-bold text-[#12213A] dark:text-white mb-6">Profile Information</h2>
                  
                  {error && (
                    <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/25 p-4 text-xs font-semibold text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2447A5] to-blue-500 flex items-center justify-center text-xl font-bold text-white shadow-lg relative group/avatar overflow-hidden">
                        {user?.name?.charAt(0) || 'U'}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-[9px] uppercase font-black text-white">Edit</span>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" className="mb-1 text-[11px] font-black tracking-wider uppercase px-3 py-1.5 cursor-pointer">
                          Upload avatar
                        </Button>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Supports PNG, JPG, or GIF. Max size 800kB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      {isFetching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F8FAFC]/50 dark:bg-[#020617]/50 backdrop-blur-sm rounded-xl">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-2.5 px-4 text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-2.5 px-4 text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workspace Authority</label>
                        <input
                          type="text"
                          disabled
                          defaultValue={user?.role}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 py-2.5 px-4 text-slate-400 dark:text-slate-500 outline-none cursor-not-allowed uppercase shadow-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800/80">
                      <Button variant="outline" className="cursor-pointer">Cancel</Button>
                      <Button onClick={handleSaveProfile} isLoading={isLoading} className="cursor-pointer">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Appearance Section */}
              {activeTab === 'Appearance' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Interface Theme</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Light mode choice */}
                      <div
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-500/5 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="h-24 w-full bg-slate-100 rounded-xl border border-slate-200 p-2 space-y-2 overflow-hidden flex flex-col justify-between">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-8 bg-blue-500 rounded-full" />
                            <div className="h-3 w-3 bg-slate-300 rounded-full" />
                          </div>
                          <div className="h-8 w-full bg-white border border-slate-200 rounded shadow-sm" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 text-center uppercase tracking-wide">Light Mode</p>
                      </div>

                      {/* Dark mode choice */}
                      <div
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-500/5 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="h-24 w-full bg-slate-950 rounded-xl border border-slate-800 p-2 space-y-2 overflow-hidden flex flex-col justify-between">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-8 bg-blue-600 rounded-full" />
                            <div className="h-3 w-3 bg-slate-800 rounded-full" />
                          </div>
                          <div className="h-8 w-full bg-slate-900 border border-slate-800 rounded shadow-sm" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 text-center uppercase tracking-wide">Dark Mode</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Brand Accent Colors</h2>
                    <p className="text-slate-400 text-xs mb-5">Change the core branding accent colors across your workspace.</p>
                    <div className="flex gap-3">
                      {[
                        { id: 'blue', color: 'bg-blue-600 border-blue-400', label: 'Classic Blue' },
                        { id: 'indigo', color: 'bg-indigo-600 border-indigo-400', label: 'Royal Indigo' },
                        { id: 'violet', color: 'bg-violet-600 border-violet-400', label: 'Elegance Violet' },
                        { id: 'emerald', color: 'bg-emerald-600 border-emerald-400', label: 'Active Emerald' }
                      ].map((accent) => (
                        <div
                          key={accent.id}
                          onClick={() => {
                            setSelectedAccent(accent.id);
                            toast.success(`Theme accent set to ${accent.label}`);
                          }}
                          className={`h-8 w-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all hover:scale-105 ${accent.color} ${
                            selectedAccent === accent.id ? 'ring-4 ring-blue-500/20 scale-105' : 'border-transparent'
                          }`}
                          title={accent.label}
                        >
                          {selectedAccent === accent.id && (
                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Notifications Section */}
              {activeTab === 'Notifications' && (
                <Card>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Notification Preferences</h2>
                  <p className="text-slate-400 text-xs mb-6">Tailor email notifications and critical real-time triggers.</p>
                  
                  <div className="space-y-5">
                    {[
                      { 
                        id: 'emailAlerts', 
                        title: 'Email Alert Notifications', 
                        desc: 'Receive digest logs for proposals, completions, and budget updates.' 
                      },
                      { 
                        id: 'bidUpdates', 
                        title: 'Proposal Status Transitions', 
                        desc: 'Receive alerts when your assigned bids advance workflow stages.' 
                      },
                      { 
                        id: 'weeklyReport', 
                        title: 'Weekly Executive Report Digest', 
                        desc: 'Receive an automated analytical compilation of wins and Conversion Ratios.' 
                      },
                      { 
                        id: 'aiInsights', 
                        title: 'Predictive AI Risk Warnings', 
                        desc: 'Receive instant notifications if Gemini detects critical portfolio risks.' 
                      }
                    ].map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20"
                      >
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[420px]">{item.desc}</p>
                        </div>
                        <Toggle 
                          checked={notifications[item.id]} 
                          onChange={() => {
                            setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                            toast.success('Notification preferences updated');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Security Section */}
              {activeTab === 'Security' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Change Account Password</h2>
                    <form onSubmit={handleSavePassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-2.5 px-4 text-slate-850 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            required
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-2.5 px-4 text-slate-850 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-2.5 px-4 text-slate-850 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <Button type="submit" isLoading={isLoading} className="cursor-pointer">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </Card>

                  <Card>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Two-Factor Authentication (2FA)</h2>
                    <p className="text-slate-400 text-xs mb-6">Protect your account using custom security codes sent to your phone or authenticator app.</p>
                    
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20">
                      <div className="flex gap-3.5 items-center">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-150 dark:border-blue-900 text-blue-500 dark:text-blue-400">
                          <Key className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-semibold text-slate-850 dark:text-white">Enable Multi-Factor Authentication</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Enforce extra safety validations on login credentials</p>
                        </div>
                      </div>
                      <Toggle 
                        checked={securitySettings.twoFactor} 
                        onChange={() => {
                          setSecuritySettings(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
                          toast.success(securitySettings.twoFactor ? 'Two-Factor Auth disabled' : 'Two-Factor Auth enabled');
                        }}
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* Devices Section */}
              {activeTab === 'Devices' && (
                <Card>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Active Sessions</h2>
                  <p className="text-slate-400 text-xs mb-6">List of devices currently logged into your BidAI profile. You can revoke access below.</p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        device: 'Chrome on Windows 11',
                        ip: '192.168.1.45',
                        location: 'New Delhi, India',
                        current: true,
                        time: 'Active now'
                      },
                      {
                        device: 'Safari on iPhone 15 Pro',
                        ip: '192.168.1.92',
                        location: 'New Delhi, India',
                        current: false,
                        time: 'Logged in: 2 hours ago'
                      }
                    ].map((session, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20"
                      >
                        <div className="flex gap-4 items-center min-w-0">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{session.device}</h3>
                              {session.current && (
                                <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 px-2 py-0.5 text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                              IP: {session.ip} &bull; Location: {session.location}
                            </p>
                          </div>
                        </div>

                        {!session.current && (
                          <button
                            onClick={() => toast.success('Active device session revoked successfully')}
                            className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 uppercase tracking-widest border border-red-500/20 hover:border-red-500/40 rounded-xl px-3 py-1.5 bg-red-500/5 transition-all cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
