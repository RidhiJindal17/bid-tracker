import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Left side - Visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-violet-900/20 via-[#020617] to-blue-900/20 lg:flex">
        <div className="relative h-[80%] w-[80%] max-w-2xl">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-600/20 to-blue-600/20 blur-3xl" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass relative h-full w-full rounded-[2.5rem] p-12 overflow-hidden"
          >
            <div className="mb-12">
              <h2 className="mb-6 text-4xl font-bold leading-tight text-white">
                Everything you need to <span className="text-gradient">dominate the market.</span>
              </h2>
              <div className="space-y-6">
                {[
                  'Real-time bid intelligence and alerts',
                  'Automated workflow automation for teams',
                  'Advanced AI-driven win probability analysis',
                  'Custom white-label reporting for stakeholders'
                ].map((text, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-slate-300">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mockup chart */}
            <div className="absolute -bottom-10 -left-10 w-full p-10 transform -rotate-2">
               <div className="glass h-48 rounded-2xl p-6 shadow-2xl flex items-end justify-between gap-2">
                  {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 0.8 + (i * 0.05) }}
                      className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-500 rounded-t-lg"
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
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
          <h1 className="mb-2 text-3xl font-bold text-white">Get started</h1>
          <p className="text-slate-400">Create your account to start tracking bids</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 pl-11 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 pl-11 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
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
            Create account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
