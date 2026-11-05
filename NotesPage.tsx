import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Star,
  Copy,
  Trash2,
  Edit2,
  Download,
  Eye,
  UploadCloud,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  X,
  Check,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note, NoteCategory, EducationalFileMeta } from '../types';

export const NotesPage: React.FC = () => {
  const {
    notes,
    subjects,
    files,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    toggleFavoriteNote,
    uploadFile,
    downloadFile,
    getFileBlob,
    renameFile,
    deleteFile,
    showToast
  } = useApp();

  // Active Main Tab: 'notes' | 'files'
  const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal State for Note Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Note Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formCategory, setFormCategory] = useState<NoteCategory>('General');
  const [formTags, setFormTags] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsFavorite, setFormIsFavorite] = useState(false);

  // View Details Modal for Notes
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // File Operations State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [renameModalFile, setRenameModalFile] = useState<EducationalFileMeta | null>(null);
  const [newFileName, setNewFileName] = useState('');
  
  // File Preview Modal State
  const [previewFile, setPreviewFile] = useState<EducationalFileMeta | null>(null);
  const [previewFileBlobUrl, setPreviewFileBlobUrl] = useState<string | null>(null);
  const [previewFileText, setPreviewFileText] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const categories: NoteCategory[] = ['General', 'DSA', 'DBMS', 'Exams', 'Resources'];

  const openAddModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormCategory('General');
    setFormTags('');
    setFormIsPinned(false);
    setFormIsFavorite(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormSubjectId(note.subjectId);
    setFormCategory(note.category);
    setFormTags(note.tags.join(', '));
    setFormIsPinned(note.isPinned);
    setFormIsFavorite(note.isFavorite);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (editingNote) {
      updateNote(editingNote.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        subjectId: formSubjectId,
        category: formCategory,
        tags: parsedTags,
        isPinned: formIsPinned,
        isFavorite: formIsFavorite
      });
    } else {
      addNote({
        title: formTitle.trim(),
        content: formContent.trim(),
        subjectId: formSubjectId,
        category: formCategory,
        tags: parsedTags,
        isPinned: formIsPinned,
        isFavorite: formIsFavorite
      });
    }

    setIsModalOpen(false);
  };

  const handleCopy = (note: Note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    showToast('Copied to Clipboard', `Note "${note.title}" copied.`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload handler for files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        await uploadFile(uploadedFiles[i]);
      }
    } catch {
      showToast('Upload Failed', 'Failed to store file in IndexedDB.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Open Preview for File
  const handleOpenFilePreview = async (file: EducationalFileMeta) => {
    setPreviewFile(file);
    setIsLoadingPreview(true);
    setPreviewFileBlobUrl(null);
    setPreviewFileText(null);

    try {
      const blob = await getFileBlob(file.id);
      if (blob) {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(blob);
          setPreviewFileBlobUrl(url);
        } else if (file.type.includes('text') || file.type.includes('json') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const text = await blob.text();
          setPreviewFileText(text);
        } else {
          // For PDF or other formats, create an object URL for preview or download link
          const url = URL.createObjectURL(blob);
          setPreviewFileBlobUrl(url);
        }
      }
    } catch {
      showToast('Error', 'Could not load file preview.', 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closeFilePreview = () => {
    if (previewFileBlobUrl) {
      URL.revokeObjectURL(previewFileBlobUrl);
    }
    setPreviewFile(null);
    setPreviewFileBlobUrl(null);
    setPreviewFileText(null);
  };

  const handleOpenRename = (file: EducationalFileMeta) => {
    setRenameModalFile(file);
    setNewFileName(file.name);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameModalFile || !newFileName.trim()) return;
    renameFile(renameModalFile.id, newFileName.trim());
    setRenameModalFile(null);
  };

  // Helper for formatting file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper for file type icon
  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return <PresentationIcon className="w-5 h-5 text-amber-500" />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return <FileSpreadsheet className="w-5 h-5 text-teal-500" />;
    if (type.includes('text') || name.endsWith('.txt') || name.endsWith('.md')) return <FileCode className="w-5 h-5 text-indigo-500" />;
    return <File className="w-5 h-5 text-purple-500" />;
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }

        if (selectedCategory !== 'all' && n.category !== selectedCategory) {
          return false;
        }

        if (selectedSubject !== 'all' && n.subjectId !== selectedSubject) {
          return false;
        }

        if (onlyFavorites && !n.isFavorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, searchQuery, selectedCategory, selectedSubject, onlyFavorites]);

  // Filtered Files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (f.isDeleted) return false;
      if (!searchQuery.trim()) return true;
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [files, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            Notes & Educational Files
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formulas, lecture summaries, cheatsheets, and offline IndexedDB course documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'notes' ? (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Study Note</span>
            </button>
          ) : (
            <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap">
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Study Notes</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-extrabold">
            {notes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'files'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Educational Files (IndexedDB)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-extrabold">
            {filteredFiles.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: STUDY NOTES */}
      {activeTab === 'notes' && (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, formulas, tags..."
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Subject filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Favorite toggle */}
                <button
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    onlyFavorites
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      onlyFavorites ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span>Favorites</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-xs font-medium mr-1 shrink-0">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                All Notes ({notes.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FileText className="w-12 h-12 text-purple-200 dark:text-purple-900 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No notes match your filters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Create formulas, summaries, or code snippets for your semester courses.
              </p>
              <button
                onClick={openAddModal}
                className="mt-2 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl"
              >
                + Create New Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => {
                const subject = subjects.find((s) => s.id === note.subjectId);
                const isCopied = copiedId === note.id;

                return (
                  <motion.div
                    key={note.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                      note.isPinned
                        ? 'border-purple-300 dark:border-purple-600 ring-2 ring-purple-100/80 dark:ring-purple-900/40'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                            {note.category}
                          </span>
                          {note.isPinned && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                              <Pin className="w-3 h-3 fill-purple-600" />
                              <span>Pinned</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavoriteNote(note.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                            title={note.isFavorite ? 'Remove favorite' : 'Mark favorite'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                note.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => togglePinNote(note.id)}
                            className={`p-1 rounded-lg transition-colors ${
                              note.isPinned
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-slate-400 hover:text-purple-600'
                            }`}
                            title={note.isPinned ? 'Unpin note' : 'Pin to top'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Preview */}
                      <h3
                        onClick={() => setPreviewNote(note)}
                        className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2 cursor-pointer hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                      >
                        {note.title}
                      </h3>

                      <p
                        onClick={() => setPreviewNote(note)}
                        className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line line-clamp-4 bg-slate-50/70 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer"
                      >
                        {note.content}
                      </p>

                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {note.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Metadata & Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                          {subject?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(note)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                          title="Copy note"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(note)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Move to trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: UPLOADED EDUCATIONAL FILES (INDEXEDDB) */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 hover:border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50/70 transition-all rounded-3xl p-8 text-center cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop syllabus documents or lecture slides
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PDF, PPT, PPTX, DOC, DOCX, TXT, images (PNG, JPG, WebP) up to 25MB.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
              Stored persistently in browser IndexedDB
            </span>
          </div>

          {/* Files List & Search */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Uploaded Study Resources ({filteredFiles.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter files by name..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No files uploaded yet for this user profile.
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload PDF past papers, lecture slides, or diagrams to keep them offline.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-xs shrink-0">
                            {getFileIcon(file.type, file.name)}
                          </div>
                          <div className="min-w-0">
                            <h4
                              onClick={() => handleOpenFilePreview(file)}
                              className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                              title={file.name}
                            >
                              {file.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatFileSize(file.size)} • {file.uploadDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                      <button
                        onClick={() => handleOpenFilePreview(file)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700"
                        title="Preview File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => downloadFile(file.id)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700"
                        title="Download to computer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenRename(file)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-700"
                        title="Move to trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note Reader Modal */}
      <AnimatePresence>
        {previewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    {previewNote.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Updated: {previewNote.updatedAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(previewNote)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Copy content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewNote(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{previewNote.title}</h2>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {previewNote.content}
                </div>

                {previewNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {previewNote.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium text-slate-600 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingNote ? 'Edit Study Note' : 'Create Study Note'}
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
                    Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Dijkstra Algorithm Pseudocode & Time Complexities"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
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
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Note Content & Formulas *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Type key definitions, steps, formulas, code snippets..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono bg-slate-50/50 dark:bg-slate-800 resize-none leading-relaxed"
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
                    placeholder="algorithms, midterms, graphs, cheatsheet"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pin to top</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFavorite}
                      onChange={(e) => setFormIsFavorite(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Star as favorite</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-sm"
                  >
                    {editingNote ? 'Save Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Rename Modal */}
      <AnimatePresence>
        {renameModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Rename File
              </h3>
              <form onSubmit={handleSaveRename} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    File Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenameModalFile(null)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
                  >
                    Save Name
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {previewFile.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(previewFile.size)} • {previewFile.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(previewFile.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={closeFilePreview}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex items-center justify-center min-h-[300px]">
                {isLoadingPreview ? (
                  <p className="text-xs text-slate-400">Loading document from IndexedDB...</p>
                ) : previewFile.type.startsWith('image/') && previewFileBlobUrl ? (
                  <img
                    src={previewFileBlobUrl}
                    alt={previewFile.name}
                    className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm"
                  />
                ) : previewFileText !== null ? (
                  <pre className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-[60vh]">
                    {previewFileText}
                  </pre>
                ) : (
                  <div className="text-center space-y-3 py-6">
                    <FileText className="w-16 h-16 text-purple-300 dark:text-purple-700 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Preview is ready for this document.
                    </p>
                    <button
                      onClick={() => downloadFile(previewFile.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Download to open in your system viewer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Presentation Icon
function PresentationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h20" />
      <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
      <path d="m7 21 5-5 5 5" />
    </svg>
  );
}
