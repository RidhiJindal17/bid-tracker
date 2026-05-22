import React from 'react';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400">View your personal activity and stats.</p>
      </div>
      <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed border-slate-700 bg-transparent gap-4">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-slate-400">{user?.email}</p>
        <div className="px-3 py-1 mt-2 rounded-full bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
           {user?.role || 'User'}
        </div>
      </Card>
    </PageTransition>
  );
};

export default Profile;
