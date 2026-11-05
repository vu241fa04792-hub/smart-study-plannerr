import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  X,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority, TaskStatus } from '../types';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    reopenTask
  } = useApp();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formDueDate, setFormDueDate] = useState(todayStr);
  const [formDueTime, setFormDueTime] = useState('18:00');
  const [formCategory, setFormCategory] = useState('Assignment');
  const [formTags, setFormTags] = useState('');
  const [formEstMinutes, setFormEstMinutes] = useState(60);

  // Delete Confirmation state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormDueDate(todayStr);
    setFormDueTime('18:00');
    setFormCategory('Assignment');
    setFormTags('');
    setFormEstMinutes(60);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormSubjectId(task.subjectId);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '18:00');
    setFormCategory(task.category || 'Assignment');
    setFormTags((task.tags || []).join(', '));
    setFormEstMinutes(task.estimatedMinutes || 60);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        subjectId: formSubjectId,
        priority: formPriority,
        status: formStatus,
        dueDate: formDueDate,
        dueTime: formDueTime,
        category: formCategory.trim(),
        tags: parsedTags,
        estimatedMinutes: Number(formEstMinutes)
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDesc.trim(),
        subjectId: formSubjectId || (subjects[0]?.id ?? 'sub-general'),
        priority: formPriority,
        status: formStatus,
        dueDate: formDueDate,
        dueTime: formDueTime,
        category: formCategory.trim(),
        tags: parsedTags,
        estimatedMinutes: Number(formEstMinutes)
      });
    }

    setIsModalOpen(false);
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTag = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // Status filter
      if (statusFilter === 'completed') {
        if (t.status !== 'completed') return false;
      } else if (statusFilter === 'today') {
        if (t.dueDate !== today) return false;
      } else if (statusFilter === 'upcoming') {
        if (t.dueDate <= today || t.status === 'completed') return false;
      } else if (statusFilter === 'overdue') {
        if (t.dueDate >= today || t.status === 'completed') return false;
      }

      // Subject filter
      if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const pOrder: Record<Priority, number> = { urgent: 1, high: 2, medium: 3, low: 4 };
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, searchQuery, statusFilter, subjectFilter, priorityFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-white tracking-tight">
            My Tasks & Coursework
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage assignments, homework deadlines, problem sets, and study objectives.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* 2. Controls, Filters, Search & View Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search & View mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'title')}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>

            {/* List / Grid Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-purple-600 dark:text-purple-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-purple-600 dark:text-purple-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Tasks' },
                { id: 'today', label: 'Due Today' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'completed', label: 'Completed' }
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === filter.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Subject Dropdown Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Dropdown Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 3. Tasks Render (List or Grid) */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <CheckSquare className="w-12 h-12 text-purple-200 dark:text-purple-900 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No tasks found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {tasks.length === 0
              ? 'Your tasks list is currently empty. Create your first assignment or study goal.'
              : 'No tasks match the active filters or search keyword.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-xl"
          >
            + Create New Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const subject = subjects.find((s) => s.id === task.subjectId);
            const isOverdue = task.dueDate < todayStr && !isDone;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${
                  isDone ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-70' : ''
                }`}
              >
                {/* Complete checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-purple-600'
                  }`}
                  aria-label={isDone ? 'Reopen task' : 'Mark task complete'}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'urgent'
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : task.priority === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Overdue indicator */}
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    )}

                    {/* Category */}
                    {task.category && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {task.category}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{subject?.name || 'General'}</span>
                    </div>

                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.dueDate}</span>
                      {task.dueTime && <span>({task.dueTime})</span>}
                    </div>

                    {task.estimatedMinutes && (
                      <>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.estimatedMinutes} min</span>
                        </div>
                      </>
                    )}

                    {(task.tags || []).length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{task.tags?.join(', ')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isDone ? (
                    <button
                      onClick={() => reopenTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                      title="Reopen task"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : null}

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                    title="Move to trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const subject = subjects.find((s) => s.id === task.subjectId);
            const isOverdue = task.dueDate < todayStr && !isDone;

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-purple-200 dark:hover:border-purple-800 ${
                  isDone ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: (subject?.color || '#8B5CF6') + '20',
                        color: subject?.color || '#8B5CF6'
                      }}
                    >
                      {subject?.code || 'General'}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        task.priority === 'urgent'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                          : task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5 ${
                      isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-purple-600 text-slate-600 dark:text-slate-400'
                      }`}
                      title={isDone ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Study Task'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Master Bellman-Ford Shortest Path Algorithm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formSubjectId}
                      onChange={(e) => setFormSubjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as Priority)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formDueTime}
                      onChange={(e) => setFormDueTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Est. Minutes
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={5}
                      value={formEstMinutes}
                      onChange={(e) => setFormEstMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Assignment, Lab, Reading"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="midterms, coding, dp"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Description & Learning Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide details, reading chapters, or practice problem numbers..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-sm"
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Move to Recently Deleted?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  &ldquo;{taskToDelete.title}&rdquo; will be moved to Recently Deleted. You can restore it anytime.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Keep Task
                </button>
                <button
                  onClick={() => {
                    deleteTask(taskToDelete.id);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Move to Trash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
