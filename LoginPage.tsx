import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Eye, EyeOff, Lock, Mail, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, accounts, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Validation Error', 'Please enter your email and password.', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectTarget);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    showToast('Password Reset Link Sent', `Demo reset instructions sent to ${forgotEmail}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD] dark:bg-slate-950 text-[#1E1B4B] dark:text-slate-100 flex flex-col justify-center items-center p-4 relative selection:bg-purple-100 selection:text-purple-900 transition-colors duration-200">
      {/* Background aura */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand header */}
      <div className="mb-6 text-center">
        <NavLink to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <GraduationCap className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1E1B4B] dark:text-white">
            Smart Study Planner
          </span>
        </NavLink>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Plan Smart. Study Better. Achieve More.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 relative z-10"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your academic dashboard, coursework, and timer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSubmitted(false);
                  setForgotEmail(email);
                }}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 select-none">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer pt-3"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Need a fresh, empty student workspace?{' '}
            <NavLink to={`/register${location.search}`} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Create Account
            </NavLink>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Enter your student email address to receive a demo reset link.
            </p>

            {forgotSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Reset instructions sent!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Check your inbox or sign in directly.</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
