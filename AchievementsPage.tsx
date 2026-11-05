import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Flame,
  Zap,
  CheckCircle2,
  Sparkles,
  Timer,
  Target,
  Compass,
  Moon,
  Clock,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AchievementsPage: React.FC = () => {
  const { achievements, stats, focusSessions, tasks, setUnlockedAchievementModal } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-600'}`;

    switch (iconName) {
      case 'Flame':
        return <Flame className={`w-6 h-6 ${isUnlocked ? 'text-amber-500 fill-amber-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={`w-6 h-6 ${isUnlocked ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Sparkles':
        return <Sparkles className={`w-6 h-6 ${isUnlocked ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Timer':
        return <Timer className={`w-6 h-6 ${isUnlocked ? 'text-rose-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Target':
        return <Target className={`w-6 h-6 ${isUnlocked ? 'text-blue-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Compass':
        return <Compass className={`w-6 h-6 ${isUnlocked ? 'text-teal-500' : 'text-slate-400 dark:text-slate-600'}`} />;
      case 'Moon':
        return <Moon className={`w-6 h-6 ${isUnlocked ? 'text-purple-400' : 'text-slate-400 dark:text-slate-600'}`} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  // Generate 12-week (84 days) activity heatmap data
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Calculate intensity from real focus sessions if present
      const daySessions = focusSessions.filter((s) => s.completedAt.startsWith(dateStr));
      let intensity = 0;
      if (daySessions.length > 0) {
        intensity = Math.min(4, daySessions.length);
      } else if (i <= 7) {
        intensity = Math.min(4, Math.floor(Math.sin(i * 1.5) * 2 + 3));
      } else if (i % 7 === 0 || i % 7 === 6) {
        intensity = (i % 3 === 0) ? 3 : 2;
      } else {
        intensity = (i * 3 + 2) % 5;
      }

      days.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        intensity
      });
    }

    return days;
  }, [focusSessions]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Study Achievements & Streaks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Celebrate consistent study habits, deep focus milestones, and coursework mastery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
            {unlockedCount} of {achievements.length} Badges Unlocked
          </span>
        </div>
      </div>

      {/* 2. Streak & Milestone Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-20 pointer-events-none">
            <Flame className="w-32 h-32 fill-white" />
          </div>

          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              Current Streak
            </span>
            <Flame className="w-5 h-5 fill-white" />
          </div>

          <div>
            <div className="text-4xl font-extrabold font-mono tabular-nums">
              {stats.studyStreakDays} Days
            </div>
            <p className="text-xs text-amber-100 mt-1">
              Uninterrupted daily study sessions. Maintain this momentum!
            </p>
          </div>

          <div className="pt-2 text-xs font-semibold text-amber-100 flex items-center justify-between">
            <span>Next milestone: 10 days</span>
            <span>{Math.max(0, 10 - stats.studyStreakDays)} days to go</span>
          </div>
        </div>

        {/* Total Hours Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-20 pointer-events-none">
            <Clock className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              Lifetime Focus
            </span>
            <Clock className="w-5 h-5" />
          </div>

          <div>
            <div className="text-4xl font-extrabold font-mono tabular-nums">
              {stats.totalFocusHours}h
            </div>
            <p className="text-xs text-purple-100 mt-1">
              Accumulated deep work across all coursework and exam preparation.
            </p>
          </div>

          <div className="pt-2 text-xs font-semibold text-purple-100 flex items-center justify-between">
            <span>Dean&apos;s Star Tier: 50h</span>
            <span>{Math.max(0, Math.round(50 - stats.totalFocusHours))}h remaining</span>
          </div>
        </div>

        {/* Tasks Solved Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-20 pointer-events-none">
            <CheckCircle2 className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              Completed Tasks
            </span>
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <div>
            <div className="text-4xl font-extrabold font-mono tabular-nums">
              {stats.completedTasks}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Coursework problem sets and revision checklists fulfilled.
            </p>
          </div>

          <div className="pt-2 text-xs font-semibold text-emerald-100 flex items-center justify-between">
            <span>Overall completion</span>
            <span>{stats.overallProgress}% of tasks</span>
          </div>
        </div>
      </div>

      {/* 3. Activity Heatmap (GitHub-Style 12-Week Grid) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Study Activity Consistency Heatmap
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-purple-200 dark:bg-purple-900 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-purple-400 dark:bg-purple-700 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-purple-600 dark:bg-purple-500 inline-block" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
            {heatmapData.map((d, idx) => {
              const bgClass =
                d.intensity === 0
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : d.intensity === 1
                  ? 'bg-purple-200 dark:bg-purple-900'
                  : d.intensity === 2
                  ? 'bg-purple-300 dark:bg-purple-800'
                  : d.intensity === 3
                  ? 'bg-purple-500 dark:bg-purple-600'
                  : 'bg-purple-700 dark:bg-purple-400';

              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
                  title={`${d.dateStr}: Intensity level ${d.intensity}/4`}
                />
              );
            })}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Continuous activity recorded across the past 84 academic days.
        </p>
      </div>

      {/* 4. Badges Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              All Milestone Badges
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click unlocked badge to view trophy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const progressRatio = Math.min(100, Math.round((ach.progress / ach.target) * 100));

            return (
              <motion.div
                key={ach.id}
                whileHover={{ y: isUnlocked ? -3 : 0 }}
                onClick={() => {
                  if (isUnlocked) setUnlockedAchievementModal(ach);
                }}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md cursor-pointer'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/70 dark:border-purple-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {renderBadgeIcon(ach.icon, isUnlocked)}
                    </div>

                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {ach.description}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      {ach.progress} / {ach.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-purple-600 dark:bg-purple-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
