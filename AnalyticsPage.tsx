import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { tasks, subjects, stats, focusSessions, settings } = useApp();

  // Dynamic Weekly Chart Data from actual focusSessions + daily target
  const weeklyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    // Monday of current week
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);

    return days.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];

      // Sum minutes logged on that day
      const dayMinutes = focusSessions
        .filter((s) => s.type === 'focus' && s.completedAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      // Baseline fallback for visual beauty if user has empty sessions
      const hours = dayMinutes > 0 ? Number((dayMinutes / 60).toFixed(1)) : 0;
      const goal = settings.studyPreferences.dailyGoalHours || 4;

      return {
        day: dayName,
        date: dateStr,
        hours,
        goal
      };
    });
  }, [focusSessions, settings]);

  // Subject distribution for Donut Chart
  const subjectDistributionData = useMemo(() => {
    if (subjects.length === 0) {
      return [{ name: 'No Subjects', value: 1, color: '#8B5CF6' }];
    }

    return subjects.map((sub) => {
      const subTasks = tasks.filter((t) => t.subjectId === sub.id);
      const focusCount = focusSessions.filter((s) => s.subjectId === sub.id).length;
      const topicCount = sub.topics?.length || 0;
      const weight = Math.max(1, subTasks.length * 2 + focusCount * 3 + topicCount);
      return {
        name: sub.name,
        code: sub.code,
        value: weight,
        color: sub.color || '#8B5CF6'
      };
    });
  }, [subjects, tasks, focusSessions]);

  // Task Completion breakdown
  const taskStatusData = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;

    return [
      { name: 'To Do', count: todo, fill: '#6366F1' },
      { name: 'In Progress', count: inProgress, fill: '#8B5CF6' },
      { name: 'Completed', count: completed, fill: '#10B981' }
    ];
  }, [tasks]);

  // Best performing subject
  const bestSubject = useMemo(() => {
    if (subjects.length === 0) return { subject: null, rate: 0 };
    let topSub = subjects[0];
    let topRate = -1;

    subjects.forEach((s) => {
      const subTasks = tasks.filter((t) => t.subjectId === s.id);
      if (subTasks.length > 0) {
        const comp = subTasks.filter((t) => t.status === 'completed').length;
        const rate = comp / subTasks.length;
        if (rate > topRate) {
          topRate = rate;
          topSub = s;
        }
      }
    });

    return {
      subject: topSub,
      rate: topRate >= 0 ? Math.round(topRate * 100) : 100
    };
  }, [subjects, tasks]);

  const weeklyTotalLogged = weeklyChartData.reduce((acc, c) => acc + c.hours, 0).toFixed(1);
  const weeklyGoalTarget = ((settings.studyPreferences.dailyGoalHours || 4) * 7).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Academic Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor study habits, task velocity, syllabus pacing, and productivity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{stats.studyStreakDays}-Day Consistency Streak</span>
          </span>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Total Study</span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono tabular-nums">
            {weeklyTotalLogged}h
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
            Target: {weeklyGoalTarget}h ({Math.min(100, Math.round((Number(weeklyTotalLogged) / Number(weeklyGoalTarget)) * 100))}% reached)
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Best Performing Course</span>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">
            {bestSubject.subject?.name || 'All Caught Up'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
            {bestSubject.rate}% assignment completion
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Focus Blocks</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {focusSessions.filter((s) => s.type === 'focus').length}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
            {stats.totalFocusHours} total logged hours
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Completion Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {stats.overallProgress}%
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
            {stats.completedTasks} completed of {stats.totalTasks} tasks
          </span>
        </div>
      </div>

      {/* 3. Primary Charts Grid (Weekly Bar + Syllabus Completion) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Study Hours vs Goal */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Weekly Focus Hours vs. Goal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily study hours recorded this week
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
              Current Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{data.day} ({data.date})</p>
                          <p className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                            Studied: {data.hours} hrs
                          </p>
                          <p className="text-slate-400 font-mono">Goal: {data.goal} hrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="hours" name="Logged Hours" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="goal" name="Daily Target" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Syllabus Progress by Subject */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Syllabus Unit Completion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stats.completedTopicsCount} of {stats.totalTopicsCount} syllabus topics mastered
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.totalTopicsCount > 0
                ? Math.round((stats.completedTopicsCount / stats.totalTopicsCount) * 100)
                : 0}% Overall
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {subjects.map((sub) => {
              const topics = sub.topics || [];
              const total = topics.length;
              const completed = topics.filter((t) => t.completed).length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] shrink-0">
                      {completed}/{total} topics ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: sub.color || '#8B5CF6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Secondary Row: Subject Distribution Donut & Task Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Donut Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Study Time Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coursework load balanced by subject
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subjectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{data.name}</p>
                          <p className="text-purple-600 dark:text-purple-400 font-mono">
                            Weight: {data.value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Status */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Task Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current status of all planned assignments
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={taskStatusData}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{data.name}</p>
                          <p className="text-purple-600 dark:text-purple-400 font-mono">
                            {data.count} tasks
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
