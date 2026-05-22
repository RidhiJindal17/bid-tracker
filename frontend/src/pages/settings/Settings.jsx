import React, { useState, useEffect } from 'react';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User, Bell, Shield, Palette, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
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

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Example API call to update settings
      await api.put('/auth/updatedetails', formData);
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Settings update error:', err);
      const message = err.response?.data?.message || 'Failed to update settings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {[
            { icon: User, label: 'Profile', active: true },
            { icon: Palette, label: 'Appearance', active: false },
            { icon: Bell, label: 'Notifications', active: false },
            { icon: Shield, label: 'Security', active: false },
            { icon: Smartphone, label: 'Devices', active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <Button variant="outline" className="mb-2">Upload new picture</Button>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020617]/50 backdrop-blur-sm rounded-xl">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Role</label>
                  <input
                    type="text"
                    disabled
                    defaultValue={user?.role}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-slate-500 outline-none cursor-not-allowed uppercase"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} isLoading={isLoading}>Save Changes</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Theme Preferences</h2>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div>
                <h3 className="text-sm font-medium text-white">Dark Mode</h3>
                <p className="text-xs text-slate-400">Toggle dark mode interface</p>
              </div>
              <div 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
