import React from 'react';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#12213A] dark:text-white">My Profile</h1>
        <p className="text-[#5B6B8A] dark:text-slate-400">View your personal activity and stats.</p>
      </div>
      <Card className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-[#DCE3F1] dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm gap-4 shadow-sm">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#2447A5] to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h2 className="text-xl font-bold text-[#12213A] dark:text-white">{user?.name}</h2>
        <p className="text-[#5B6B8A] dark:text-slate-400">{user?.email}</p>
        <div className="px-3 py-1 mt-2 rounded-full bg-[#EAF1FF] dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-[#2447A5] dark:text-slate-300 border border-[#2447A5]/10 dark:border-slate-700/50">
           {user?.role || 'User'}
        </div>
      </Card>
    </PageTransition>
  );
};

export default Profile;
