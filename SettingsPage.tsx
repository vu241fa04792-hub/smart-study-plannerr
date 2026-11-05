import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  BookOpen,
  ShieldAlert,
  Save,
  AlertTriangle,
  Info,
  Camera,
  Trash2,
  Database,
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    settings,
    updateSettings,
    uploadProfilePhoto,
    removeProfilePhoto,
    clearMyWorkspaceData,
    migrateToSupabase,
    isSupabaseConnected,
    migrateToDjango,
    isDjangoConnected,
    showToast
  } = useApp();

  type TabId = 'profile' | 'notifications' | 'study' | 'privacy';
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Form states initialized from settings
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [email, setEmail] = useState(settings.email);
  const [bio, setBio] = useState(settings.bio);

  const [taskReminders, setTaskReminders] = useState(settings.notifications.taskReminders);
  const [examReminders, setExamReminders] = useState(settings.notifications.examReminders);
  const [dailyReminder, setDailyReminder] = useState(settings.notifications.dailyStudyReminder);

  const [dailyGoalHours, setDailyGoalHours] = useState(
    settings.studyPreferences.dailyGoalHours
  );
  const [defaultFocusMinutes, setDefaultFocusMinutes] = useState(
    settings.studyPreferences.defaultFocusMinutes
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    settings.studyPreferences.shortBreakMinutes
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    settings.studyPreferences.longBreakMinutes
  );
  const [preferredStudyTime, setPreferredStudyTime] = useState(
    settings.studyPreferences.preferredStudyTime
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadProfilePhoto(file);
    } catch {
      showToast('Error', 'Failed to upload profile photo.', 'error');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      displayName: displayName.trim(),
      email: email.trim(),
      bio: bio.trim()
    });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      notifications: {
        ...settings.notifications,
        taskReminders,
        examReminders,
        dailyStudyReminder: dailyReminder
      }
    });
  };

  const handleSaveStudyPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studyPreferences: {
        dailyGoalHours: Number(dailyGoalHours),
        defaultFocusMinutes: Number(defaultFocusMinutes),
        shortBreakMinutes: Number(shortBreakMinutes),
        longBreakMinutes: Number(longBreakMinutes),
        preferredStudyTime
      }
    });
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      await migrateToSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'study' as const, label: 'Study Preferences', icon: BookOpen },
    { id: 'privacy' as const, label: 'Privacy & Storage', icon: ShieldAlert }
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your student identity, timer intervals, notification badges, and theme appearance.
        </p>
      </div>

      {/* 2. Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm max-w-3xl">
        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal details shown across your dashboard and generated study timetables.
              </p>
            </div>

            {/* Avatar management */}
            <div className="flex items-center gap-4 pt-2">
              <div className="relative group">
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt={settings.displayName}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900/50 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {getInitials(displayName || currentUser?.name || 'User')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-transform active:scale-95"
                  title="Upload avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{settings.displayName}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {currentUser?.email || settings.email}
                </p>
                {settings.avatarUrl && (
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 pt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove avatar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Bio & Academic Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What degree or certifications are you working on?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab: Notifications */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control simulated deadline alerts and achievement badges in the top menu.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Assignment Deadline Reminders</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive alert notifications when coursework is due within 24 hours.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={taskReminders}
                  onChange={(e) => setTaskReminders(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Exam Countdown Reminders</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get alerted 7 days and 3 days before scheduled midterm exams.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={examReminders}
                  onChange={(e) => setExamReminders(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Daily Study Streak Notifications</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Daily nudge to log at least one focus session and preserve your streak.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Rules</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab: Study Preferences */}
        {activeTab === 'study' && (
          <form onSubmit={handleSaveStudyPrefs} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Study & Focus Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default timers and daily target hours for the Pomodoro clock and AI Planner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Daily Study Goal (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={0.5}
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Default Focus Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={90}
                  step={5}
                  value={defaultFocusMinutes}
                  onChange={(e) => setDefaultFocusMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Short Break Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Long Break Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={45}
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Study Window
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPreferredStudyTime(t)}
                    className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                      preferredStudyTime === t
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Study Preferences</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab: Privacy & Storage */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Privacy & Storage Isolation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Information about client-side persistence and per-account data separation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                <strong>Isolated Local Storage:</strong> Every user account has its own isolated dataset stored directly in your browser under <code className="font-mono bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1 py-0.5 rounded">smart_study_{currentUser?.id || 'demo'}_*</code>.
              </p>
              <p>
                <strong>Educational Files:</strong> File blobs (PDFs, slides, documents) are stored inside your browser&apos;s native <strong>IndexedDB</strong> under the store <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">educational_files</code>.
              </p>
              <p>
                Offline local storage enables full offline operation, while Django REST Framework with PostgreSQL provides cloud sync, API services, and multi-device persistence.
              </p>
            </div>

            {/* Django REST Framework Cloud Connection & Sync Card */}
            <div className="p-5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Django REST Framework & PostgreSQL
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isDjangoConnected ? 'Connected to Django Backend API (Port 8000) & PostgreSQL' : 'Operating in Local / Offline Mode'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isDjangoConnected
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDjangoConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isDjangoConnected ? 'Django API Ready' : 'Offline / Local'}
                  </span>
                </div>
              </div>

              {isDjangoConnected && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-purple-100 dark:border-purple-900/40">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Sync local tasks, syllabus items, notes, files metadata, and study plans to your Django PostgreSQL database:
                  </span>
                  <button
                    type="button"
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync to Django Backend'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">Clear My Workspace Data</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed max-w-xl">
                    Permanently delete all coursework, tasks, notes, syllabus items, calendar events, focus history, and uploaded files for your account (<span className="font-semibold">{currentUser?.email}</span>). Other accounts will not be affected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Clear My Workspace Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Workspace Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Clear My Workspace Data?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  This will permanently wipe the following data for account <span className="font-bold text-purple-600 dark:text-purple-400">{currentUser?.email}</span>:
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                  <li>All Tasks & Assignment Schedules</li>
                  <li>All Course Subjects & Syllabus Checklists</li>
                  <li>All Study Notes & Revision Sheets</li>
                  <li>All Calendar Events & Exam Milestones</li>
                  <li>All Focus Timer Sessions & Study Plans</li>
                  <li>All Uploaded Educational Files (IndexedDB)</li>
                </ul>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Your login credentials remain intact. No other user account will be modified or affected.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await clearMyWorkspaceData();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer"
                >
                  Yes, Clear My Workspace Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
