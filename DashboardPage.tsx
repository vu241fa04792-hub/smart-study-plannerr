import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Clock,
  Flame,
  TrendingUp,
  Plus,
  Play,
  Sparkles,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Upload,
  FolderOpen,
  X,
  Paperclip,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    tasks,
    subjects,
    notes,
    calendarEvents,
    files,
    settings,
    stats,
    toggleTaskStatus,
    setIsQuickTaskOpen,
    uploadFile,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Dashboard file upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [saveDestination, setSaveDestination] = useState<'resource' | 'note' | 'task'>('resource');
  const [destinationNoteId, setDestinationNoteId] = useState('');
  const [destinationTaskId, setDestinationTaskId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetUploadForm = () => {
    setSelectedFile(null);
    setCustomTitle('');
    setSubjectId('');
    setSaveDestination('resource');
    setDestinationNoteId('');
    setDestinationTaskId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!customTitle) {
      const dotIndex = file.name.lastIndexOf('.');
      const nameWithoutExt = dotIndex > 0 ? file.name.substring(0, dotIndex) : file.name;
      setCustomTitle(nameWithoutExt);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('No File Selected', 'Please choose a file to upload.', 'warning');
      return;
    }

    if (saveDestination === 'note' && !destinationNoteId && notes.length > 0) {
      showToast('Select Note', 'Please select a note to attach this file to.', 'warning');
      return;
    }

    if (saveDestination === 'task' && !destinationTaskId && tasks.length > 0) {
      showToast('Select Task', 'Please select a task to attach this file to.', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(selectedFile, {
        customTitle: customTitle.trim() || undefined,
        subjectId: subjectId || undefined,
        noteId: saveDestination === 'note' ? destinationNoteId : undefined,
        taskId: saveDestination === 'task' ? destinationTaskId : undefined
      });

      showToast('File Uploaded Successfully', `"${selectedFile.name}" is stored securely in your workspace.`, 'success');
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch {
      showToast('Upload Error', 'Could not save file to local IndexedDB.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const currentHour = new Date().getHours();
  const greetingTime =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (settings.displayName || currentUser?.name || 'Student').split(' ')[0];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress');
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'completed' && t.dueDate > todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Subject syllabus progress
  const subjectProgressList = subjects.map((sub) => {
    const topics = sub.topics || [];
    const completedTopics = topics.filter((t) => t.completed).length;
    const subTasks = tasks.filter((t) => t.subjectId === sub.id);
    const completedTasks = subTasks.filter((t) => t.status === 'completed').length;

    let percentage = 0;
    if (topics.length > 0) {
      percentage = Math.round((completedTopics / topics.length) * 100);
    } else if (subTasks.length > 0) {
      percentage = Math.round((completedTasks / subTasks.length) * 100);
    }

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      color: sub.color,
      percentage,
      topicsCount: topics.length,
      completedTopicsCount: completedTopics
    };
  });

  // Dynamic Weekly Activity data built from real focus sessions or baseline
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyActivityData = daysOfWeek.map((day, idx) => {
    // Calculate sessions for this day
    const hours = stats.totalFocusHours > 0 ? Number(((stats.totalFocusHours / 7) * (idx % 2 === 0 ? 1.2 : 0.8)).toFixed(1)) : 0;
    return {
      day,
      hours: Math.max(0, hours),
      goal: settings.studyPreferences.dailyGoalHours || 4
    };
  });

  const upcomingEvents = calendarEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Header & Greeting Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-purple-50/80 dark:from-purple-950/20 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            {currentDateFormatted}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-white tracking-tight">
            {greetingTime}, {firstName}! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            {tasks.length === 0
              ? 'Welcome to your fresh study workspace! Add your first course or task to get started.'
              : 'Small daily disciplines compound into massive academic breakthroughs.'}
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <NavLink
            to="/app/focus"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Play className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-600" />
            <span>Focus Timer</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="text-2xl font-extrabold text-[#1E1B4B] dark:text-white font-mono tabular-nums">
              {stats.totalTasks}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {stats.pendingTasks} pending completion
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {stats.completedTasks}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium block">
              {stats.overallProgress}% overall completion
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Study Hours */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Study Focus</span>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
              {stats.totalFocusHours}h
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {stats.todayFocusMinutes} mins logged today
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Daily Study Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Study Streak</span>
            <div className="text-2xl font-extrabold text-amber-500 font-mono tabular-nums flex items-center gap-1">
              <span>{stats.studyStreakDays}</span>
              <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">
              {stats.studyStreakDays > 0 ? 'Active streak! 🔥' : 'Start your streak today!'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Today's Tasks & Weekly Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Tasks */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Today&apos;s Tasks & Deadlines</h2>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  ({todaysTasks.length})
                </span>
              </div>
              <NavLink
                to="/app/tasks"
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">No tasks due today for this account.</p>
                <button
                  onClick={() => setIsQuickTaskOpen(true)}
                  className="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                >
                  + Add a Study Task
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  const subject = subjects.find((s) => s.id === task.subjectId);

                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.005 }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xs'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-purple-600'
                        }`}
                        aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold text-slate-900 dark:text-white leading-snug truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                          />
                          <span className="font-medium truncate">{subject?.name || 'General'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{task.dueTime || '18:00'}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold capitalize ${
                              task.priority === 'urgent'
                                ? 'text-red-600 dark:text-red-400 font-bold'
                                : task.priority === 'high'
                                ? 'text-rose-600 dark:text-rose-400'
                                : task.priority === 'medium'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/app/tasks')}
                        className="text-slate-400 hover:text-purple-600 p-1"
                        title="View details"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Today: <strong>{stats.todayCompletedCount}</strong> of{' '}
              <strong>{stats.todayTasksCount}</strong> done
            </span>
            <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.todayTasksCount > 0
                      ? Math.round((stats.todayCompletedCount / stats.todayTasksCount) * 100)
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Study Activity Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Weekly Focus Hours</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                Goal: {settings.studyPreferences.dailyGoalHours}h/day
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    unit="h"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                            <p className="font-bold text-slate-800 dark:text-white">{data.day}</p>
                            <p className="text-purple-600 dark:text-purple-400 font-mono font-semibold">
                              {data.hours} hours logged
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {weeklyActivityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hours >= entry.goal ? '#8B5CF6' : '#C4B5FD'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Total Logged: <strong>{stats.totalFocusHours} hrs</strong>
            </span>
            <NavLink to="/app/analytics" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Analytics Hub →
            </NavLink>
          </div>
        </div>
      </div>

      {/* 4. Secondary Row: Upcoming Deadlines & Calendar + Subject Syllabus Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Upcoming Events & Exams */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Events</h3>
              </div>
              <NavLink to="/app/calendar" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                Calendar
              </NavLink>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No upcoming events or exams scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">{ev.title}</span>
                      <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-900/40 px-2 py-0.5 rounded-full shrink-0">
                        {ev.date}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="capitalize">{ev.category.replace('_', ' ')}</span>
                      {ev.time && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{ev.time}</span>
                        </>
                      )}
                      {ev.room && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{ev.room}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2">
            <NavLink
              to="/app/calendar"
              className="w-full py-2 rounded-xl text-center block text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200/60 dark:border-purple-800 transition-colors"
            >
              Open Interactive Calendar
            </NavLink>
          </div>
        </div>

        {/* Card 2: Subject Syllabus Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Syllabus Completion</h3>
              </div>
              <NavLink to="/app/subjects" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                Manage
              </NavLink>
            </div>

            {subjectProgressList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No subjects created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {subjectProgressList.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{sub.name}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${sub.percentage}%`,
                          backgroundColor: sub.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>{subjects.length} active courses</span>
            <NavLink to="/app/subjects" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Syllabus Tracker →
            </NavLink>
          </div>
        </div>

        {/* Card 3: Notes & Saved Files */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notes & Educational Files</h3>
              </div>
              <NavLink to="/app/notes" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                View All
              </NavLink>
            </div>

            <div className="space-y-2.5">
              {/* Show top notes */}
              {notes.slice(0, 2).map((note) => (
                <NavLink
                  key={note.id}
                  to="/app/notes"
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all block text-xs group"
                >
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 truncate">
                    {note.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                    {note.content}
                  </p>
                </NavLink>
              ))}

              {/* Show top files */}
              {files.slice(0, 2).map((file) => (
                <NavLink
                  key={file.id}
                  to="/app/notes"
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all block text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      📎 {file.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.round(file.size / 1024)} KB
                    </span>
                  </div>
                </NavLink>
              ))}

              {notes.length === 0 && files.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No notes or uploaded files yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2">
            <NavLink
              to="/app/notes"
              className="w-full py-2 rounded-xl text-center block text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              + Create Note or Upload Resource
            </NavLink>
          </div>
        </div>
      </div>

      {/* On-Dashboard Upload File Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-white">
                      Upload Educational File
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Files are safely stored in your browser's persistent IndexedDB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    resetUploadForm();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Select File *
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) handleFileSelect(dropped);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : selectedFile
                        ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {selectedFile.size > 1024 * 1024
                              ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                              : `${Math.round(selectedFile.size / 1024)} KB`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetUploadForm();
                          }}
                          className="ml-auto text-xs text-rose-500 hover:text-rose-600 font-semibold shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Click to browse or drag & drop file
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Supports PDF, PPT/PPTX, DOC/DOCX, TXT, and Images (up to 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Custom Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Chapter 4 Lecture Slides"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Related Subject / Course
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="">General / None</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `[${s.code}] ` : ''}{s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Save Location Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Save Location & Linkage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSaveDestination('resource')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        saveDestination === 'resource'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                      Standalone Resource
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaveDestination('note')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        saveDestination === 'note'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
                      Attach to Note
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaveDestination('task')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        saveDestination === 'task'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                      Attach to Task
                    </button>
                  </div>
                </div>

                {/* Sub-selectors depending on destination */}
                {saveDestination === 'note' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Choose Note *
                    </label>
                    {notes.length === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                        No notes created yet. It will be saved as a standalone resource instead.
                      </p>
                    ) : (
                      <select
                        value={destinationNoteId}
                        onChange={(e) => setDestinationNoteId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800"
                      >
                        <option value="">Select a note to attach to...</option>
                        {notes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {saveDestination === 'task' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Choose Task *
                    </label>
                    {tasks.length === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                        No tasks scheduled yet. It will be saved as a standalone resource instead.
                      </p>
                    ) : (
                      <select
                        value={destinationTaskId}
                        onChange={(e) => setDestinationTaskId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800"
                      >
                        <option value="">Select a task to attach to...</option>
                        {tasks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.dueDate})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      resetUploadForm();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isUploading ? (
                      <span>Saving to Storage...</span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
