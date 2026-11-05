import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  X,
  Trash2,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, CalendarEvent, CalendarEventCategory } from '../types';

export const CalendarPage: React.FC = () => {
  const {
    tasks,
    subjects,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    addTask
  } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected event or task modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Add Item for Date Modal
  const [targetDateForNew, setTargetDateForNew] = useState<string | null>(null);
  const [newType, setNewType] = useState<'event' | 'task'>('event');
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTime, setNewTime] = useState('10:00');
  const [newCategory, setNewCategory] = useState<CalendarEventCategory>('exam');
  const [newRoom, setNewRoom] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Month Grid days
  const monthGridDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({ dayNumber: dayNum, dateStr, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const dateStr = curDate.toISOString().split('T')[0];
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !targetDateForNew) return;

    if (newType === 'event') {
      addCalendarEvent({
        title: newTitle.trim(),
        subjectId: newSubjectId,
        date: targetDateForNew,
        time: newTime,
        category: newCategory,
        room: newRoom.trim() || undefined,
        description: newDescription.trim() || undefined
      });
    } else {
      addTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        subjectId: newSubjectId,
        priority: 'medium',
        status: 'todo',
        dueDate: targetDateForNew,
        dueTime: newTime,
        estimatedMinutes: 60,
        category: 'Assignment'
      });
    }

    // Reset
    setTargetDateForNew(null);
    setNewTitle('');
    setNewDescription('');
    setNewRoom('');
  };

  const getEventBadgeStyle = (category: CalendarEventCategory) => {
    switch (category) {
      case 'exam':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      case 'assignment':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'study_session':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
      case 'lecture':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Study Calendar & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize exam schedules, project deadlines, lecture times, and study blocks.
          </p>
        </div>

        {/* View Switcher & Today button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-xs"
          >
            Today
          </button>

          <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                viewMode === 'month'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* 2. Month Bar & Category Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {monthNames[month]} {year}
              </h2>
              <span className="text-[11px] text-slate-400">
                {calendarEvents.length} calendar events · {tasks.length} assignment deadlines
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 text-xs font-medium mr-1 shrink-0">Filter:</span>
          {['all', 'exam', 'assignment', 'study_session', 'lecture'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Calendar Month View */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-3 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {monthGridDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;

              // Filter events for this cell
              const dayEvents = calendarEvents.filter((e) => {
                if (e.date !== cell.dateStr) return false;
                if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
                return true;
              });

              // Filter tasks for this cell
              const dayTasks = tasks.filter((t) => {
                if (t.dueDate !== cell.dateStr) return false;
                if (selectedCategory !== 'all' && selectedCategory !== 'assignment') return false;
                return true;
              });

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                      : 'bg-white dark:bg-slate-900'
                  } ${isToday ? 'bg-purple-50/40 dark:bg-purple-950/30' : ''}`}
                >
                  {/* Top Day Number Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isToday
                          ? 'bg-purple-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Quick add button on hover */}
                    <button
                      onClick={() => setTargetDateForNew(cell.dateStr)}
                      className="text-slate-300 dark:text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 p-0.5 rounded transition-colors"
                      title={`Schedule for ${cell.dateStr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Events list in cell */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-24">
                    {/* Calendar Events */}
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold truncate block transition-transform hover:scale-[1.02] ${getEventBadgeStyle(
                          event.category
                        )}`}
                      >
                        {event.category === 'exam' && '🎓 '}
                        {event.title}
                      </button>
                    ))}

                    {/* Tasks */}
                    {dayTasks.map((task) => {
                      const isDone = task.status === 'completed';
                      const subject = subjects.find((s) => s.id === task.subjectId);
                      return (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                            isDone
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                          />
                          <span className="truncate">{task.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right">
                    {dayEvents.length + dayTasks.length > 0 && (
                      <span>{dayEvents.length + dayTasks.length} items</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Agenda List View */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CalendarCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Upcoming Study Agenda
            </h3>
          </div>

          <div className="space-y-3">
            {[...calendarEvents]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evt) => {
                const sub = subjects.find((s) => s.id === evt.subjectId);
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 hover:bg-purple-50/20 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                        {evt.category === 'exam' ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : (
                          <CalendarIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub?.name || 'General'} · {evt.date} {evt.time ? `at ${evt.time}` : ''}
                          {evt.room ? ` (${evt.room})` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${getEventBadgeStyle(
                        evt.category
                      )}`}
                    >
                      {evt.category.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getEventBadgeStyle(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      deleteCalendarEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedEvent.title}
                </h3>
                {selectedEvent.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedEvent.date}
                  </span>
                </div>
                {selectedEvent.time && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Scheduled Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.time}
                    </span>
                  </div>
                )}
                {selectedEvent.room && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Location / Room:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.room}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  Assignment Task
                </span>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Course:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {subjects.find((s) => s.id === selectedTask.subjectId)?.name || 'General'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Due Date:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedTask.dueDate} {selectedTask.dueTime && `· ${selectedTask.dueTime}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <span className="font-bold capitalize text-purple-600 dark:text-purple-400">
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Item for Date Modal */}
      <AnimatePresence>
        {targetDateForNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Schedule on {targetDateForNew}
                </h3>
                <button
                  onClick={() => setTargetDateForNew(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewType('event')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    newType === 'event'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Calendar Event
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('task')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    newType === 'task'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Study Task / Deadline
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={newType === 'event' ? 'e.g. Midterm Examination' : 'e.g. Finish Problem Set 4'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Subject
                    </label>
                    <select
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {newType === 'event' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as CalendarEventCategory)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="study_session">Study Session</option>
                        <option value="lecture">Lecture</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Room / Hall
                      </label>
                      <input
                        type="text"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="e.g. Hall B302"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Preparation notes or room guidance..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetDateForNew(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                  >
                    Save to Calendar
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
