import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Network,
  Database,
  Wifi,
  Calculator,
  Cpu,
  GraduationCap,
  ListTodo,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, SyllabusTopic } from '../types';

export const SubjectsPage: React.FC = () => {
  const {
    subjects,
    tasks,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopicToSubject,
    toggleTopicCompletion,
    deleteTopicFromSubject
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [icon, setIcon] = useState('BookOpen');
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(6);
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');

  // Expanded syllabus drawer in cards
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [newTopicInputs, setNewTopicInputs] = useState<Record<string, string>>({});

  // Delete confirm state
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const colorPalette = [
    '#8B5CF6',
    '#6366F1',
    '#0EA5E9',
    '#10B981',
    '#EC4899',
    '#F59E0B',
    '#EF4444',
    '#14B8A6'
  ];

  const iconOptions = [
    { id: 'BookOpen', label: 'Book', Icon: BookOpen },
    { id: 'Network', label: 'Network/Graphs', Icon: Network },
    { id: 'Database', label: 'Database', Icon: Database },
    { id: 'Wifi', label: 'Networking', Icon: Wifi },
    { id: 'Calculator', label: 'Math', Icon: Calculator },
    { id: 'Cpu', label: 'Systems', Icon: Cpu },
    { id: 'GraduationCap', label: 'Cap', Icon: GraduationCap }
  ];

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDescription('');
    setColor('#8B5CF6');
    setIcon('BookOpen');
    setTargetHoursPerWeek(6);
    setInstructor('');
    setRoom('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setDescription(sub.description);
    setColor(sub.color);
    setIcon(sub.icon);
    setTargetHoursPerWeek(sub.targetHoursPerWeek);
    setInstructor(sub.instructor || '');
    setRoom(sub.room || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
        icon,
        targetHoursPerWeek: Number(targetHoursPerWeek),
        instructor: instructor.trim(),
        room: room.trim()
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
        icon,
        targetHoursPerWeek: Number(targetHoursPerWeek),
        instructor: instructor.trim(),
        room: room.trim(),
        topics: [
          { id: 'top-' + Date.now() + '-1', title: 'Unit 1: Fundamentals & Theory', completed: false },
          { id: 'top-' + Date.now() + '-2', title: 'Unit 2: Applied Methodologies', completed: false }
        ]
      });
    }

    setIsModalOpen(false);
  };

  const renderSubjectIcon = (iconName: string, iconColor: string) => {
    const item = iconOptions.find((i) => i.id === iconName) || iconOptions[0];
    const IconComponent = item.Icon;
    return <IconComponent className="w-5 h-5" style={{ color: iconColor }} />;
  };

  const handleAddTopic = (subjectId: string) => {
    const inputVal = newTopicInputs[subjectId] || '';
    if (!inputVal.trim()) return;
    addTopicToSubject(subjectId, inputVal.trim());
    setNewTopicInputs((prev) => ({ ...prev, [subjectId]: '' }));
  };

  // Filter subjects by query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.instructor && s.instructor.toLowerCase().includes(q))
    );
  }, [subjects, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-white tracking-tight">
            Subjects & Syllabus Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your courses, break down syllabus units, and track topic mastery.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* 2. Search & Stats Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name, code, instructor..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
          />
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          <span>
            Total Courses: <strong className="text-slate-800 dark:text-white">{subjects.length}</strong>
          </span>
          <span>
            Linked Tasks: <strong className="text-slate-800 dark:text-white">{tasks.length}</strong>
          </span>
        </div>
      </div>

      {/* 3. Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-purple-200 dark:text-purple-900 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No subjects found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {subjects.length === 0
              ? 'Add your first semester course and break down its syllabus topics.'
              : 'No subjects match your search keyword.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-xl"
          >
            + Create New Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredSubjects.map((sub) => {
            const topics = sub.topics || [];
            const completedTopics = topics.filter((t) => t.completed).length;
            const subTasks = tasks.filter((t) => t.subjectId === sub.id);
            const completedTasks = subTasks.filter((t) => t.status === 'completed').length;

            const progressPercent =
              topics.length > 0
                ? Math.round((completedTopics / topics.length) * 100)
                : subTasks.length > 0
                ? Math.round((completedTasks / subTasks.length) * 100)
                : 0;

            const isExpanded = expandedSubjectId === sub.id;

            return (
              <motion.div
                key={sub.id}
                layout
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-200 dark:hover:border-purple-800 transition-all"
              >
                <div>
                  {/* Header row with icon and code */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                      style={{
                        backgroundColor: sub.color + '15',
                        borderColor: sub.color + '30'
                      }}
                    >
                      {renderSubjectIcon(sub.icon, sub.color)}
                    </div>

                    <span
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg border"
                      style={{
                        color: sub.color,
                        backgroundColor: sub.color + '10',
                        borderColor: sub.color + '25'
                      }}
                    >
                      {sub.code}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {sub.description}
                  </p>

                  {/* Syllabus Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Syllabus Progress</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: sub.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Topic breakdown stat strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 mb-4">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Syllabus Units</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {completedTopics} / {topics.length} Done
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Weekly Target</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {sub.targetHoursPerWeek} hrs/wk
                      </span>
                    </div>
                  </div>

                  {/* Expand / Collapse Syllabus Checklist Button */}
                  <button
                    onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                    className="w-full py-2 px-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-between transition-colors mb-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>Syllabus Checklist ({topics.length})</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expanded Syllabus Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mb-4 overflow-hidden pt-1"
                      >
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {topics.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No topics added yet.</p>
                          ) : (
                            topics.map((top) => (
                              <div
                                key={top.id}
                                className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-colors ${
                                  top.completed
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/60 text-slate-500 line-through'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <button
                                  onClick={() => toggleTopicCompletion(sub.id, top.id)}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center mr-2 shrink-0 ${
                                    top.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {top.completed && <Check className="w-3 h-3" />}
                                </button>
                                <span className="flex-1 truncate">{top.title}</span>
                                <button
                                  onClick={() => deleteTopicFromSubject(sub.id, top.id)}
                                  className="text-slate-400 hover:text-rose-500 ml-2"
                                  title="Delete topic"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Topic Input */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newTopicInputs[sub.id] || ''}
                            onChange={(e) =>
                              setNewTopicInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTopic(sub.id);
                              }
                            }}
                            placeholder="Add syllabus unit / topic..."
                            className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTopic(sub.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Instructor & Room info */}
                  {(sub.instructor || sub.room) && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-4">
                      {sub.instructor && (
                        <p>
                          Instructor: <strong className="text-slate-700 dark:text-slate-300">{sub.instructor}</strong>
                        </p>
                      )}
                      {sub.room && (
                        <p>
                          Location: <span className="text-slate-600 dark:text-slate-400">{sub.room}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {subTasks.length} linked tasks
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSubjectToDelete(sub)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Distributed Operating Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="CS401"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Subject Description & Scope
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key concepts, syllabus overview, textbook references..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {colorPalette.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-xl transition-transform ${
                          color === c ? 'scale-110 ring-2 ring-offset-2 ring-purple-600' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Icon Representation
                  </label>
                  <div className="flex items-center gap-2">
                    {iconOptions.map((opt) => {
                      const IconComp = opt.Icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIcon(opt.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            icon === opt.id
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                          title={opt.label}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Weekly Target (hrs)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={targetHoursPerWeek}
                      onChange={(e) => setTargetHoursPerWeek(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      placeholder="Prof. Smith"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Classroom / Lab
                    </label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Hall 302"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    />
                  </div>
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
                    {editingSubject ? 'Save Changes' : 'Add Subject'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {subjectToDelete && (
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Subject?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to remove &ldquo;{subjectToDelete.name}&rdquo;? Associated tasks will remain in your planner.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSubjectToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteSubject(subjectToDelete.id);
                    setSubjectToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Delete Subject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
