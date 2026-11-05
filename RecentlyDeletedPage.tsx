import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  FileText,
  Calendar,
  FolderOpen,
  X,
  Paperclip
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeletedItem } from '../types';

export const RecentlyDeletedPage: React.FC = () => {
  const { deletedItems, restoreItem, permanentlyDeleteItem, emptyTrash } = useApp();

  const [itemToDeleteForever, setItemToDeleteForever] = useState<DeletedItem | null>(null);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'task' | 'note' | 'file' | 'event'>('all');

  const filteredItems = deletedItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-5 h-5" />;
      case 'note':
        return <FileText className="w-5 h-5" />;
      case 'file':
        return <FolderOpen className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Trash2 className="w-5 h-5" />;
    }
  };

  const getItemBadgeStyle = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800';
      case 'note':
        return 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-800';
      case 'file':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800';
      case 'event':
        return 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Recently Deleted
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Restore items back to active coursework or permanently discard them.
          </p>
        </div>

        {deletedItems.length > 0 && (
          <button
            onClick={() => setShowEmptyTrashConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash ({deletedItems.length})</span>
          </button>
        )}
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'task', 'note', 'file', 'event'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'all'
                ? 'All Items'
                : type === 'task'
                ? 'Tasks'
                : type === 'note'
                ? 'Notes'
                : type === 'file'
                ? 'IndexedDB Files'
                : 'Events'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          {filteredItems.length} items in trash
        </span>
      </div>

      {/* 3. Items List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Trash2 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Trash is completely empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When you delete tasks, notes, files, or events, they will appear here so you can easily restore them.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredItems.map((item) => {
            const dateStr = new Date(item.deletedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getItemBadgeStyle(
                      item.type
                    )}`}
                  >
                    {getItemIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.type}
                      </span>
                      {item.attachedFiles && item.attachedFiles.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                          <Paperclip className="w-3 h-3" />
                          <span>{item.attachedFiles.length} {item.attachedFiles.length === 1 ? 'attachment' : 'attachments'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Deleted on {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => restoreItem(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => setItemToDeleteForever(item)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Permanently Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permanently Delete Single Item Confirmation Modal */}
      <AnimatePresence>
        {itemToDeleteForever && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete Permanently?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  &ldquo;{itemToDeleteForever.title}&rdquo; will be permanently erased from browser storage and cannot be restored.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setItemToDeleteForever(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    permanentlyDeleteItem(itemToDeleteForever.id);
                    setItemToDeleteForever(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty Trash Confirmation Modal */}
      <AnimatePresence>
        {showEmptyTrashConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Empty Entire Trash?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  This will permanently destroy all {deletedItems.length} deleted items from memory and IndexedDB.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowEmptyTrashConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    emptyTrash();
                    setShowEmptyTrashConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Empty Trash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
