import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundFx } from '../utils/sound';

export const FocusTimerPage: React.FC = () => {
  const {
    subjects,
    tasks,
    recordFocusSession,
    focusSessions,
    stats,
    showToast,
    settings
  } = useApp();

  type TimerMode = 'focus' | 'short_break' | 'long_break';

  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusDurationMin, setFocusDurationMin] = useState(
    settings.studyPreferences.defaultFocusMinutes || 25
  );
  const [shortBreakMin, setShortBreakMin] = useState(
    settings.studyPreferences.shortBreakMinutes || 5
  );
  const [longBreakMin, setLongBreakMin] = useState(
    settings.studyPreferences.longBreakMinutes || 15
  );

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(focusDurationMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullScreenFocus, setIsFullScreenFocus] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const timerRef = useRef<number | null>(null);

  // Total seconds for current mode
  const totalSecondsForMode =
    mode === 'focus'
      ? focusDurationMin * 60
      : mode === 'short_break'
      ? shortBreakMin * 60
      : longBreakMin * 60;

  // Sync time when mode or duration changes (if not running)
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'focus') setTimeLeftSeconds(focusDurationMin * 60);
      else if (mode === 'short_break') setTimeLeftSeconds(shortBreakMin * 60);
      else setTimeLeftSeconds(longBreakMin * 60);
    }
  }, [mode, focusDurationMin, shortBreakMin, longBreakMin, isRunning]);

  // Main tick interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, focusDurationMin, shortBreakMin, longBreakMin]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (isSoundEnabled) {
      soundFx.playChime();
    }

    if (mode === 'focus') {
      recordFocusSession({
        durationMinutes: focusDurationMin,
        subjectId: selectedSubjectId || undefined,
        taskId: selectedTaskId || undefined,
        completedAt: new Date().toISOString(),
        type: 'focus'
      });
      showToast(
        'Deep Work Complete! 🎉',
        `Logged ${focusDurationMin} minutes of focus time. Take a well-deserved break!`,
        'success'
      );
      setMode('short_break');
      setTimeLeftSeconds(shortBreakMin * 60);
    } else {
      showToast(
        'Break Complete!',
        'Time to jump back into your study flow with renewed energy.',
        'info'
      );
      setMode('focus');
      setTimeLeftSeconds(focusDurationMin * 60);
    }
  };

  const handleStartPause = () => {
    soundFx.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundFx.playClick();
    setIsRunning(false);
    setTimeLeftSeconds(totalSecondsForMode);
  };

  const handleSkip = () => {
    soundFx.playClick();
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('short_break');
      setTimeLeftSeconds(shortBreakMin * 60);
    } else {
      setMode('focus');
      setTimeLeftSeconds(focusDurationMin * 60);
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular progress math
  const circleRadius = 140;
  const circumference = 2 * Math.PI * circleRadius;
  const progressRatio = (totalSecondsForMode - timeLeftSeconds) / totalSecondsForMode;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Today's completed focus sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = focusSessions.filter(
    (s) => s.type === 'focus' && s.completedAt.startsWith(todayStr)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Pomodoro Focus Timer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Boost focus, eliminate distractions, and optimize cognitive retention.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              isSoundEnabled
                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title={isSoundEnabled ? 'Chime sound enabled' : 'Sound muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Focus Toggle */}
          <button
            onClick={() => setIsFullScreenFocus(!isFullScreenFocus)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Focus Mode</span>
          </button>
        </div>
      </div>

      {/* 2. Main Timer Canvas & Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Circular Timer */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          {/* Pastel background aura */}
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 -z-10"
            style={{
              backgroundColor:
                mode === 'focus'
                  ? 'rgba(139, 92, 246, 0.08)'
                  : mode === 'short_break'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(14, 165, 233, 0.08)'
            }}
          />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
            <button
              onClick={() => {
                setMode('focus');
                setIsRunning(false);
                setTimeLeftSeconds(focusDurationMin * 60);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Focus ({focusDurationMin}m)
            </button>
            <button
              onClick={() => {
                setMode('short_break');
                setIsRunning(false);
                setTimeLeftSeconds(shortBreakMin * 60);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'short_break'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Short Break ({shortBreakMin}m)
            </button>
            <button
              onClick={() => {
                setMode('long_break');
                setIsRunning(false);
                setTimeLeftSeconds(longBreakMin * 60);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'long_break'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Long Break ({longBreakMin}m)
            </button>
          </div>

          {/* SVG Circular Timer */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 320 320">
              {/* Background ring */}
              <circle
                cx="160"
                cy="160"
                r={circleRadius}
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="12"
              />
              {/* Animated Progress ring */}
              <circle
                cx="160"
                cy="160"
                r={circleRadius}
                fill="none"
                stroke={
                  mode === 'focus' ? '#8B5CF6' : mode === 'short_break' ? '#10B981' : '#0EA5E9'
                }
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-linear"
              />
            </svg>

            {/* Center Time & Active Subject text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-extrabold text-[#1E1B4B] dark:text-slate-100 font-mono tabular-nums tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">
                {mode === 'focus' ? 'Deep Work Flow' : 'Relax & Recharge'}
              </span>

              {mode === 'focus' && currentSubject && (
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentSubject.color }}
                  />
                  <span className="truncate max-w-[140px]">{currentSubject.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartPause}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>{timeLeftSeconds < totalSecondsForMode ? 'Resume' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Skip this session"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Settings, Active Tagging & Today's Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Subject & Task Tagging */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Tag Current Session</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Active Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Link to Assignment (Optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              >
                <option value="">-- No specific task link --</option>
                {tasks
                  .filter((t) => t.status !== 'completed')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Custom Duration Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Session Length
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 25, 45, 50].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setFocusDurationMin(dur);
                      if (mode === 'focus' && !isRunning) {
                        setTimeLeftSeconds(dur * 60);
                      }
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      focusDurationMin === dur
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Focus Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Today&apos;s Focus Achievements</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
                  Completed Blocks
                </span>
                <span className="text-2xl font-extrabold text-purple-900 dark:text-purple-100 font-mono tabular-nums">
                  {todaySessions.length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">
                  Focus Minutes
                </span>
                <span className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 font-mono tabular-nums">
                  {stats.todayFocusMinutes}m
                </span>
              </div>
            </div>

            {/* Recent Completed Sessions Log */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Recent Sessions</span>
              {focusSessions.slice(0, 3).map((ses) => {
                const sub = subjects.find((s) => s.id === ses.subjectId);
                return (
                  <div
                    key={ses.id}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sub?.name || 'General Focus'}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {ses.durationMinutes}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Focus Overlay (Distraction-Free Mode) */}
      <AnimatePresence>
        {isFullScreenFocus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F7F8FD] dark:bg-slate-950 text-[#1E1B4B] dark:text-slate-100 flex flex-col justify-between p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Distraction-Free Study Space
                </span>
              </div>

              <button
                onClick={() => setIsFullScreenFocus(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Minimize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            {/* Huge Center Timer */}
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="text-8xl sm:text-9xl font-extrabold text-[#1E1B4B] dark:text-slate-100 font-mono tracking-tight tabular-nums">
                {formattedTime}
              </div>

              <div className="text-base font-semibold text-slate-500 dark:text-slate-400">
                {mode === 'focus' ? 'Deep Focus Session' : 'Rest & Refresh'}
                {currentSubject && ` · ${currentSubject.name}`}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleStartPause}
                  className="px-10 py-4 rounded-2xl font-bold text-base text-white bg-purple-600 hover:bg-purple-700 shadow-xl transition-all cursor-pointer"
                >
                  {isRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button
                  onClick={handleReset}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Quote */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              Smart Study Planner · Maintain posture, breathe deeply, and stay curious.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
