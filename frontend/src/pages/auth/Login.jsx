import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Zap, Mail, Lock, ArrowRight, Sparkles, Bot, TrendingUp, Users, ChevronRight } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#020617] overflow-x-hidden">
      {/* Left side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-full flex-col justify-center px-6 py-12 md:py-20 lg:w-[450px] xl:w-[500px] lg:px-12 mx-auto lg:mx-0 max-w-md lg:max-w-none"
      >
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">BidAI</span>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">Welcome back</h1>
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
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
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
            className="w-full py-4 text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30" 
            isLoading={isLoading}
          >
            Sign in <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>

      {/* Right side - Visual Showcase */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/25 via-[#020617] to-violet-950/25 border-t border-slate-900 lg:border-t-0 lg:border-l border-slate-900 p-6 md:p-10 lg:p-12 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="relative w-full max-w-2xl flex flex-col justify-between z-10">
          <div className="mb-6 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 uppercase tracking-wider backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3 animate-pulse text-blue-400" /> Next-Gen AI Capabilities
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-3 text-3xl lg:text-4xl font-extrabold leading-tight text-white tracking-tight"
            >
              Transforming the way enterprise teams track <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">high-value bids.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm lg:text-base text-slate-400 max-w-xl mx-auto lg:mx-0"
            >
              Join 500+ teams using BidAI to optimize their sales workflow and increase win rates by 40%.
            </motion.p>
          </div>

          {/* Interactive Floating Widgets Container */}
          <div className="relative w-full h-[450px] select-none">
            {/* Widget 1: AI Prediction Insights */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.3 },
                scale: { duration: 0.6, delay: 0.3 },
                y: {
                  repeat: Infinity,
                  duration: 5.5,
                  ease: "easeInOut"
                }
              }}
              whileHover={{ scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
              className="absolute top-[0px] left-[10px] w-[230px] md:w-[250px] rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-blue-500/40 hover:shadow-[0_15px_30px_rgba(37,99,235,0.1)] transition-colors duration-300 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">AI Prediction</div>
                  <div className="text-xs font-bold text-white mt-0.5">Bid ID: #RFP-2026-B</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-slate-300 font-medium leading-relaxed">
                "AI predicts <span className="text-emerald-400 font-bold">18% higher</span> approval rate for final round."
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Confidence Match</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">94.8%</span>
              </div>
            </motion.div>

            {/* Widget 2: Revenue Analytics Mini Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -12, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.4 },
                scale: { duration: 0.6, delay: 0.4 },
                y: {
                  repeat: Infinity,
                  duration: 4.8,
                  ease: "easeInOut",
                  delay: 0.5
                }
              }}
              whileHover={{ scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
              className="absolute top-[10px] right-[10px] w-[240px] md:w-[260px] rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-indigo-500/40 hover:shadow-[0_15px_30px_rgba(99,102,241,0.1)] transition-colors duration-300 hidden md:block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/10">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Win Rate Value</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">+15.4%</span>
              </div>
              
              <div className="mt-2">
                <span className="text-xl font-extrabold text-white tracking-tight">$2,480,000</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Projected pipeline for Q2</p>
              </div>
              
              {/* Mini SVG Line & Area Chart */}
              <div className="h-14 w-full mt-3">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area */}
                  <motion.path
                    d="M0,25 C10,22 15,8 30,12 C45,16 55,2 70,6 C85,10 90,0 100,2 L100,30 L0,30 Z"
                    fill="url(#chartGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  {/* Line */}
                  <motion.path
                    d="M0,25 C10,22 15,8 30,12 C45,16 55,2 70,6 C85,10 90,0 100,2"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                  />
                  {/* Pulsing indicator node */}
                  <circle cx="100" cy="2" r="3.5" fill="#a5b4fc" className="animate-ping" />
                  <circle cx="100" cy="2" r="2" fill="#6366f1" />
                </svg>
              </div>
            </motion.div>

            {/* Widget 3: Workflow Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -8, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.5 },
                scale: { duration: 0.6, delay: 0.5 },
                y: {
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                  delay: 0.2
                }
              }}
              whileHover={{ scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
              className="absolute top-[135px] left-[-10px] md:left-[-20px] w-[220px] md:w-[240px] rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-violet-500/40 hover:shadow-[0_15px_30px_rgba(139,92,246,0.1)] transition-colors duration-300 hidden md:block"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Workflow Status</span>
                <span className="text-[10px] text-slate-500 font-medium">3 active</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2 border border-slate-900/60">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white">RFP-8924 (Gov)</span>
                    <span className="text-[9px] text-slate-500">$1.2M • Bid Prep</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> Approved
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2 border border-slate-900/60">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white">RFP-4412 (NASA)</span>
                    <span className="text-[9px] text-slate-500">$850K • Pricing</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
                    <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" /> Negotiation
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2 border border-slate-900/60">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white">RFQ-9021 (Delta)</span>
                    <span className="text-[9px] text-slate-500">$430K • Review</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-400 border border-blue-500/20">
                    <span className="h-1 w-1 rounded-full bg-blue-400" /> Pending
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Widget 4: Team Performance Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.6 },
                scale: { duration: 0.6, delay: 0.6 },
                y: {
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 0.4
                }
              }}
              whileHover={{ scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
              className="absolute top-[190px] right-[-5px] md:right-[-15px] w-[230px] md:w-[250px] rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-pink-500/40 hover:shadow-[0_15px_30px_rgba(236,72,153,0.1)] transition-colors duration-300 hidden lg:block"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-400" />
                  <span className="text-xs font-semibold text-slate-400">Team hit rates</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium">Live stats</span>
              </div>
              
              <div className="space-y-3">
                {/* Team member 1 */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-white/10">
                        SJ
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Sarah Jenkins</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">84% Hit</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1.2, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Team member 2 */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-white/10">
                        DC
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">David Chen</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">79% Hit</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "79%" }}
                      transition={{ duration: 1.2, delay: 1.0 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Widget 5: AI Assistant Bubble (Chatbot preview) */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -14, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.7 },
                scale: { duration: 0.6, delay: 0.7 },
                y: {
                  repeat: Infinity,
                  duration: 5.2,
                  ease: "easeInOut",
                  delay: 0.6
                }
              }}
              whileHover={{ scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
              className="absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[270px] md:w-[310px] rounded-2xl border border-blue-500/30 bg-slate-950/85 p-4 shadow-[0_20px_40px_rgba(37,99,235,0.15)] backdrop-blur-xl hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition-colors duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Bot icon with glowing waves */}
                <div className="relative flex-shrink-0">
                  <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping opacity-60" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md border border-blue-400/20">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">BidAI Assistant</span>
                    <span className="text-[9px] text-slate-500 font-medium">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-semibold mt-1 leading-relaxed">
                    RFP analysis complete. Found <span className="text-amber-400 font-bold underline decoration-amber-400/30">3 critical compliance gaps</span> in Section 4.2.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-medium italic">99.8% compliance accuracy</span>
                    <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10 cursor-pointer">
                      Fix Gaps <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
