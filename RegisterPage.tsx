import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checkPasswordStrength, validateEmail } from '../utils/auth';

export const RegisterPage: React.FC = () => {
  const { register, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from || '/app';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Password Strength
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Required fields validation
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    // Email format validation
    if (!validateEmail(email)) {
      setError('Please enter a valid academic or personal email address (e.g. alex@university.edu).');
      return;
    }

    // Password requirements
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (!passwordStrength.requirements.hasLetter || !passwordStrength.requirements.hasNumber) {
      setError('Password must contain both letters and numbers.');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both password fields match exactly.');
      return;
    }

    // Terms validation
    if (!agreeTerms) {
      setError('You must accept the Terms of Service & Privacy Policy to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        showToast('Registration Successful', `Welcome to Smart Study Planner, ${fullName.trim()}! Your dedicated workspace is ready.`, 'success');
        navigate(redirectTarget);
      } else if (res.message) {
        setError(res.message);
      }
    } catch {
      setError('An error occurred during account creation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD] dark:bg-slate-950 text-[#1E1B4B] dark:text-slate-100 flex flex-col justify-center items-center p-4 py-8 relative selection:bg-purple-100 selection:text-purple-900 transition-colors duration-200">
      {/* Background aura */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

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
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 relative z-10"
      >
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register your student profile for a private, dedicated study workspace.
          </p>
        </div>

        {/* Account isolation & security note */}
        <div className="mb-5 p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Fresh Isolated Workspace:</span> New accounts start with a clean dashboard and separate IndexedDB file storage. Passwords are cryptographically hashed using SHA-256 before saving.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 ${
                    passwordsMatch
                      ? 'border-emerald-500 focus:ring-emerald-500/20'
                      : passwordsMismatch
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-purple-500/20 focus:border-purple-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Match Status */}
          {passwordsMatch && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          )}
          {passwordsMismatch && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-500 dark:text-rose-400 font-medium">
              <XCircle className="w-3.5 h-3.5" />
              <span>Passwords do not match</span>
            </div>
          )}

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Password Strength:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{passwordStrength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-full rounded-full transition-colors ${
                      passwordStrength.score >= level ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {passwordStrength.requirements.hasMinLength ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-0.5" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {passwordStrength.requirements.hasLetter ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-0.5" />}
                  <span>Letters (a-z, A-Z)</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {passwordStrength.requirements.hasNumber ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-0.5" />}
                  <span>Numbers (0-9)</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {passwordStrength.requirements.hasSpecial ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-0.5" />}
                  <span>Special symbol (!@#$)</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Checkbox */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 select-none leading-relaxed">
              I agree to the <span className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Terms of Service</span> and <span className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Academic Privacy Policy</span>.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <span>Creating your workspace...</span>
            ) : (
              <>
                <span>Create Account & Start</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <NavLink to={`/login${location.search}`} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Sign In
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
