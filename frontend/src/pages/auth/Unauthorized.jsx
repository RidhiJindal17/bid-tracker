import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  return (
    <PageTransition className="flex min-h-screen items-center justify-center bg-[#020617] px-6">
      <div className="relative w-full max-w-lg">
        {/* Glow ambient background aura */}
        <div className="absolute -inset-10 rounded-[2rem] bg-gradient-to-tr from-red-600/10 to-violet-600/5 blur-3xl" />
        
        <div className="glass relative rounded-[2rem] border border-slate-800/80 bg-slate-950/40 p-10 text-center shadow-2xl backdrop-blur-2xl">
          {/* Animated Lock Shield Icon */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"
          >
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </motion.div>

          {/* Heading */}
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
            Access Denied
          </h1>

          {/* Description */}
          <p className="mb-8 text-sm leading-relaxed text-slate-400">
            You do not have the required role-based clearance permissions to view this secure resource. Please contact your workspace administrator to upgrade your access privileges.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full justify-center">
                <Home className="mr-2 h-4.5 w-4.5" /> Return Dashboard
              </Button>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4.5 w-4.5" /> Go Back
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Unauthorized;
