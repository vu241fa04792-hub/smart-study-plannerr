import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  Timer,
  BarChart3,
  Sparkles,
  FileText,
  Award,
  Trash2,
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const {
    currentUser,
    logout,
    settings,
    updateSettings,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setIsSearchOpen,
    setIsQuickTaskOpen,
    deletedItems,
    isDemoUser
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Subjects', path: '/app/subjects', icon: BookOpen },
    { label: 'Calendar', path: '/app/calendar', icon: Calendar },
    { label: 'Focus Timer', path: '/app/focus', icon: Timer },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'AI Study Planner', path: '/app/planner', icon: Sparkles, badge: 'AI' },
    { label: 'Notes & Resources', path: '/app/notes', icon: FileText },
    { label: 'Achievements', path: '/app/achievements', icon: Award },
    {
      label: 'Recently Deleted',
      path: '/app/trash',
      icon: Trash2,
      count: deletedItems.length > 0 ? deletedItems.length : undefined
    },
    { label: 'Settings', path: '/app/settings', icon: Settings }
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const userInitial = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen flex bg-[#F7F8FD] dark:bg-slate-950 text-[#1E1B4B] dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop / Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-[#E5E7F0] dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:static ${
          isMobileDrawerOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Lockup */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E5E7F0] dark:border-slate-800">
          <NavLink
            to="/app"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center gap-3 overflow-hidden text-[#1E1B4B] dark:text-white group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {!isSidebarCollapsed && (
              <div className="leading-tight truncate">
                <span className="font-extrabold text-sm tracking-tight text-[#1E1B4B] dark:text-white block">
                  Smart Study Planner
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase">
                  Academic Suite
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close button */}
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}

                {!isSidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
                    {item.badge}
                  </span>
                )}

                {!isSidebarCollapsed && item.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Bottom Account Badge */}
        {!isSidebarCollapsed ? (
          <div className="p-3 border-t border-[#E5E7F0] dark:border-slate-800">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-purple-100/70 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.name || 'Local Account'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser?.email || 'Demo Session'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-[#E5E7F0] dark:border-slate-800 flex justify-center">
            <NavLink
              to="/"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
              title="Return to Landing Page"
            >
              <ExternalLink className="w-4 h-4" />
            </NavLink>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E5E7F0] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all w-44 sm:w-64 md:w-80"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Search tasks, subjects, notes, files...</span>
              <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Mode Workspace Indicator with Exit Demo */}
            {isDemoUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Demo Workspace</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 underline cursor-pointer"
                >
                  Exit Demo
                </button>
              </div>
            )}

            {/* Current Date Display */}
            <div className="hidden md:flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Light / Dark Mode Header Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <button
                            onClick={clearNotifications}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            No notifications right now. You are all caught up!
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.actionUrl) {
                                  setIsNotificationsOpen(false);
                                  navigate(n.actionUrl);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left ${
                                !n.read ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {n.timestamp}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt={settings.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {(settings.displayName || currentUser?.name || 'Account').split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 overflow-hidden p-2"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {settings.displayName || currentUser?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {settings.email || currentUser?.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/app/settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings & Preferences
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        Public Landing Page
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Banner Alert for Demo Notice */}
        <div className="bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100/60 dark:border-purple-900/40 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
          <div className="flex items-center gap-2 truncate">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">
              <strong>Smart Study Planner:</strong> Account records, files, and study logs are saved locally in your browser storage.
            </span>
          </div>
          <NavLink
            to="/app/planner"
            className="hidden md:inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 hover:underline shrink-0 ml-4"
          >
            Open AI Study Planner →
          </NavLink>
        </div>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
