import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Zap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'role_mismatch') {
      toast.error('Your role permissions have changed. Please log in again to sync.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Left side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-full flex-col justify-center px-6 lg:w-[450px] lg:px-12"
      >
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">BidAI</span>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 pl-11 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 pl-11 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg" 
            isLoading={isLoading}
          >
            Sign in <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
            Create an account
          </Link>
        </p>
      </motion.div>

      {/* Right side - Visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-900/20 via-[#020617] to-violet-900/20 lg:flex">
        <div className="relative h-[80%] w-[80%] max-w-2xl">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-violet-600/20 blur-3xl" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass relative h-full w-full rounded-[2.5rem] p-12 overflow-hidden"
          >
            <div className="mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> New AI Capabilities
              </div>
              <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
                Transforming the way enterprise teams track <span className="text-gradient">high-value bids.</span>
              </h2>
              <p className="text-lg text-slate-400">
                Join 500+ teams using BidAI to optimize their sales workflow and increase win rates by 40%.
              </p>
            </div>

            {/* Floating UI element mockup */}
            <div className="absolute -bottom-10 -right-10 w-96 transform rotate-3">
              <div className="glass rounded-2xl p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Recent Win Rates</span>
                  <span className="text-xs font-medium text-emerald-400">+12.5%</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 60 + 40}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
