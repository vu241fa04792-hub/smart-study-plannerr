import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, CheckSquare, BookOpen, FileText, ArrowRight, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, tasks, subjects, notes, files } = useApp();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'tasks' | 'subjects' | 'notes' | 'files'>('all');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { tasks: [], subjects: [], notes: [], files: [], total: 0 };
    const q = query.toLowerCase();

    const matchedTasks = tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );

    const matchedSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );

    const matchedNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q))
    );

    const matchedFiles = files.filter(
      (f) => !f.isDeleted && f.name.toLowerCase().includes(q)
    );

    return {
      tasks: matchedTasks,
      subjects: matchedSubjects,
      notes: matchedNotes,
      files: matchedFiles,
      total: matchedTasks.length + matchedSubjects.length + matchedNotes.length + matchedFiles.length
    };
  }, [query, tasks, subjects, notes, files]);

  const handleSelect = (path: string) => {
    setIsSearchOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, subjects, notes, files... (e.g. 'Dijkstra', 'DBMS', 'PDF')"
                className="w-full text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent text-base outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                ESC
              </kbd>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 sm:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs overflow-x-auto">
              <span className="text-slate-400 font-medium">Filter:</span>
              {(['all', 'tasks', 'subjects', 'notes', 'files'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors capitalize whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!query.trim() ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">Type to search across your academic workspace</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Search course codes, tasks, formulas, or uploaded IndexedDB documents.
                  </p>
                </div>
              ) : searchResults.total === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-slate-400 mt-1">Try another keyword or filter.</p>
                </div>
              ) : (
                <>
                  {/* Tasks */}
                  {(categoryFilter === 'all' || categoryFilter === 'tasks') &&
                    searchResults.tasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                          <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                          Tasks ({searchResults.tasks.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.tasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleSelect('/app/tasks')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-50/60 dark:hover:bg-slate-800 text-left transition-colors group border border-transparent hover:border-purple-100 dark:hover:border-purple-800 cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-purple-900 dark:group-hover:text-purple-300 truncate">
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Due: {task.dueDate} · Priority: {task.priority} · Status: {task.status}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Subjects */}
                  {(categoryFilter === 'all' || categoryFilter === 'subjects') &&
                    searchResults.subjects.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Subjects ({searchResults.subjects.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.subjects.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSelect('/app/subjects')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-slate-800 text-left transition-colors group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                                    {sub.name}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">({sub.code})</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sub.description}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Notes */}
                  {(categoryFilter === 'all' || categoryFilter === 'notes') &&
                    searchResults.notes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                          <FileText className="w-3.5 h-3.5 text-pink-600" />
                          Notes ({searchResults.notes.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.notes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => handleSelect('/app/notes')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-pink-50/60 dark:hover:bg-slate-800 text-left transition-colors group border border-transparent hover:border-pink-100 dark:hover:border-pink-800 cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-pink-900 dark:group-hover:text-pink-300 truncate">
                                  {note.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Category: {note.category} · Tags: {note.tags.join(', ')}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Files */}
                  {(categoryFilter === 'all' || categoryFilter === 'files') &&
                    searchResults.files.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                          Uploaded Files ({searchResults.files.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.files.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => handleSelect('/app/notes')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800 text-left transition-colors group border border-transparent hover:border-amber-100 dark:hover:border-amber-800 cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-amber-900 dark:group-hover:text-amber-300 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Size: {(file.size / 1024).toFixed(1)} KB · Stored in IndexedDB
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Click any search result to open that section</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
