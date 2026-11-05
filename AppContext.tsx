import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Task,
  Subject,
  Note,
  CalendarEvent,
  Achievement,
  AppNotification,
  UserSettings,
  FocusSession,
  DeletedItem,
  GeneratedStudyPlan,
  EducationalFileMeta,
  UserAccount,
  SyllabusTopic
} from '../types';
import {
  DEMO_USER_ID,
  INITIAL_DEMO_ACCOUNT,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_NOTES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_FOCUS_SESSIONS
} from '../data/mockData';
import { soundFx } from '../utils/sound';
import { hashPassword } from '../utils/auth';
import { generateUuid } from '../utils/uuid';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { subjectService } from '../services/subjectService';
import { noteService } from '../services/noteService';
import { fileService } from '../services/fileService';
import { calendarService } from '../services/calendarService';
import { analyticsService } from '../services/analyticsService';
import { migrationService } from '../services/migrationService';
import {
  saveFileToIndexedDB,
  getFileFromIndexedDB,
  getUserFilesFromIndexedDB,
  deleteFileFromIndexedDB,
  saveProfilePhotoToIndexedDB,
  getProfilePhotoFromIndexedDB,
  deleteProfilePhotoFromIndexedDB,
  StoredFileRecord
} from '../utils/indexedDB';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface FileUploadOptions {
  noteId?: string;
  taskId?: string;
  subjectId?: string;
  customTitle?: string;
}

interface AppContextType {
  // Auth & Account
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isDemoUser: boolean;
  enterDemoMode: () => void;
  isSupabaseConnected: boolean;
  migrateToSupabase: () => Promise<{ success: boolean; message?: string }>;
  isDjangoConnected: boolean;
  migrateToDjango: () => Promise<{ success: boolean; message?: string }>;

  // Data (Scoped to currentUser)
  tasks: Task[];
  subjects: Subject[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
  files: EducationalFileMeta[];
  achievements: Achievement[];
  notifications: AppNotification[];
  settings: UserSettings;
  focusSessions: FocusSession[];
  deletedItems: DeletedItem[];
  studyPlans: GeneratedStudyPlan[];
  toasts: ToastMessage[];

  // Global modals state
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickTaskOpen: boolean;
  setIsQuickTaskOpen: (open: boolean) => void;
  unlockedAchievementModal: Achievement | null;
  setUnlockedAchievementModal: (ach: Achievement | null) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  reopenTask: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'userId'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopicToSubject: (subjectId: string, title: string) => void;
  toggleTopicCompletion: (subjectId: string, topicId: string) => void;
  deleteTopicFromSubject: (subjectId: string, topicId: string) => void;

  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;

  // Educational Files & Attachments Actions (IndexedDB)
  uploadFile: (file: File, optionsOrNoteId?: string | FileUploadOptions) => Promise<EducationalFileMeta>;
  downloadFile: (fileId: string) => Promise<void>;
  getFileBlob: (fileId: string) => Promise<Blob | undefined>;
  renameFile: (fileId: string, newName: string) => void;
  deleteFile: (fileId: string) => void;

  // Calendar / Events
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Trash Actions
  restoreItem: (deletedId: string) => void;
  permanentlyDeleteItem: (deletedId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;

  // Focus & Study Plans
  recordFocusSession: (session: Omit<FocusSession, 'id' | 'userId'>) => void;
  saveStudyPlan: (plan: GeneratedStudyPlan) => void;
  deleteStudyPlan: (id: string) => void;
  convertPlanToTasksAndEvents: (plan: GeneratedStudyPlan) => void;

  // Achievements & Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  checkAndUnlockAchievement: (achievementId: string) => void;

  // Settings & Profile Photo
  updateSettings: (updates: Partial<UserSettings>) => void;
  uploadProfilePhoto: (file: File) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;
  resetAllDataToDefault: () => void;
  clearMyWorkspaceData: () => Promise<void>;

  // Toast UI
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Computed Metrics
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    todayTasksCount: number;
    todayCompletedCount: number;
    totalFocusHours: number;
    todayFocusMinutes: number;
    studyStreakDays: number;
    overallProgress: number;
    totalFilesCount: number;
    totalTopicsCount: number;
    completedTopicsCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'smart_study_';

function getStorageKey(userId: string, entity: string): string {
  return `${STORAGE_PREFIX}${userId}_${entity}`;
}

function loadAccountStorage<T>(userId: string, entity: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(userId, entity));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveAccountStorage<T>(userId: string, entity: string, data: T): void {
  try {
    localStorage.setItem(getStorageKey(userId, entity), JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist ${entity} for user ${userId}`, err);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Accounts Registry
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}accounts_registry`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [INITIAL_DEMO_ACCOUNT];
  });

  // Helper to retrieve active user from storage on initial mount
  const getInitialActiveUser = (): UserAccount | null => {
    try {
      const activeId = localStorage.getItem(`${STORAGE_PREFIX}active_user_id`);
      if (activeId) {
        const rawAccounts = localStorage.getItem(`${STORAGE_PREFIX}accounts_registry`);
        const accountList: UserAccount[] = rawAccounts ? JSON.parse(rawAccounts) : [INITIAL_DEMO_ACCOUNT];
        const found = accountList.find((a) => a.id === activeId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getInitialActiveUser);

  const initialUser = currentUser;
  const initialUid = initialUser ? initialUser.id : null;
  const isInitialDemo = initialUid === DEMO_USER_ID;

  const activeUserId = currentUser ? currentUser.id : '';
  const isDemoUser = currentUser?.id === DEMO_USER_ID;
  const isDjangoConnected = false;
  const isSupabaseConnected = isSupabaseConfigured; // backward compatibility

  // Ref to track which user's data is currently loaded in state, preventing cross-user write races
  const loadedUserIdRef = React.useRef<string | null>(initialUid);

  // Persist accounts list
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}accounts_registry`, JSON.stringify(accounts));
  }, [accounts]);

  // Persist active user session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}active_user_id`, currentUser.id);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}active_user_id`);
    }
  }, [currentUser]);

// Supabase Session Initializer on mount

useEffect(() => {
  let cancelled = false;

  const initializeSession = async () => {
    try {
      const authenticated = await authService.isAuthenticated();

      if (!authenticated || cancelled) return;

      const { user } = await authService.getCurrentUserProfile();

      if (cancelled) return;

      setCurrentUser(user);
      loadedUserIdRef.current = user.id;

      const [
        cloudTasks,
        cloudSubjects,
        cloudNotes,
        cloudEvents,
        cloudFiles
      ] = await Promise.all([
        taskService.fetchTasks().catch(() => []),
        subjectService.fetchSubjects().catch(() => []),
        noteService.fetchNotes().catch(() => []),
        calendarService.fetchEvents().catch(() => []),
        fileService.fetchFiles().catch(() => [])
      ]);

      if (cancelled) return;

      setTasks(cloudTasks);
      setSubjects(cloudSubjects);
      setNotes(cloudNotes);
      setCalendarEvents(cloudEvents);
      setFiles(cloudFiles);

    } catch (error) {
      console.error(
        'Supabase session initialization failed:',
        error
      );
    }
  };

  initializeSession();

  return () => {
    cancelled = true;
  };
}, []);


  // Account-Scoped States initialized directly for the active user if one exists
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'tasks', isInitialDemo ? INITIAL_TASKS : []) : []
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'subjects', isInitialDemo ? INITIAL_SUBJECTS : []) : []
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'notes', isInitialDemo ? INITIAL_NOTES : []) : []
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'calendarEvents', isInitialDemo ? INITIAL_CALENDAR_EVENTS : []) : []
  );
  const [files, setFiles] = useState<EducationalFileMeta[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'filesMeta', []) : []
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'achievements', isInitialDemo ? INITIAL_ACHIEVEMENTS : []) : []
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'notifications', isInitialDemo ? INITIAL_NOTIFICATIONS : []) : []
  );
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (!initialUser) return INITIAL_SETTINGS;
    const defaultAccountSettings: UserSettings = {
      ...INITIAL_SETTINGS,
      displayName: initialUser.name,
      email: initialUser.email,
      avatarUrl: isInitialDemo ? INITIAL_SETTINGS.avatarUrl : undefined,
      hasCustomAvatar: false
    };
    return loadAccountStorage(initialUser.id, 'settings', defaultAccountSettings);
  });
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'focusSessions', isInitialDemo ? INITIAL_FOCUS_SESSIONS : []) : []
  );
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'deletedItems', []) : []
  );
  const [studyPlans, setStudyPlans] = useState<GeneratedStudyPlan[]>(() =>
    initialUid ? loadAccountStorage(initialUid, 'studyPlans', []) : []
  );

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [unlockedAchievementModal, setUnlockedAchievementModal] = useState<Achievement | null>(null);

  // Load account data when switching currentUser
  const reloadAccountData = useCallback((user: UserAccount) => {
    const uid = user.id;
    const isDemo = uid === DEMO_USER_ID;

    setTasks(loadAccountStorage(uid, 'tasks', isDemo ? INITIAL_TASKS : []));
    setSubjects(loadAccountStorage(uid, 'subjects', isDemo ? INITIAL_SUBJECTS : []));
    setNotes(loadAccountStorage(uid, 'notes', isDemo ? INITIAL_NOTES : []));
    setCalendarEvents(loadAccountStorage(uid, 'calendarEvents', isDemo ? INITIAL_CALENDAR_EVENTS : []));
    setAchievements(loadAccountStorage(uid, 'achievements', isDemo ? INITIAL_ACHIEVEMENTS : []));
    setNotifications(loadAccountStorage(uid, 'notifications', isDemo ? INITIAL_NOTIFICATIONS : []));
    setFocusSessions(loadAccountStorage(uid, 'focusSessions', isDemo ? INITIAL_FOCUS_SESSIONS : []));
    setDeletedItems(loadAccountStorage(uid, 'deletedItems', []));
    setStudyPlans(loadAccountStorage(uid, 'studyPlans', []));
    setFiles(loadAccountStorage(uid, 'filesMeta', []));

    // Custom or default settings
    const defaultAccountSettings: UserSettings = {
      ...INITIAL_SETTINGS,
      displayName: user.name,
      email: user.email,
      avatarUrl: isDemo ? INITIAL_SETTINGS.avatarUrl : undefined,
      hasCustomAvatar: false
    };
    const loadedSettings = loadAccountStorage(uid, 'settings', defaultAccountSettings);
    setSettings(loadedSettings);

    // Check if user has an uploaded profile photo in IndexedDB
    getProfilePhotoFromIndexedDB(uid).then((blob) => {
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setSettings((prev) => ({
          ...prev,
          avatarUrl: objectUrl,
          hasCustomAvatar: true
        }));
      }
    }).catch(() => {
      // ignore
    });

    // Mark loaded user ID
    loadedUserIdRef.current = uid;
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (loadedUserIdRef.current !== currentUser.id) {
        reloadAccountData(currentUser);
      }
    } else {
      loadedUserIdRef.current = null;
      setTasks([]);
      setSubjects([]);
      setNotes([]);
      setCalendarEvents([]);
      setFiles([]);
      setAchievements([]);
      setNotifications([]);
      setFocusSessions([]);
      setDeletedItems([]);
      setStudyPlans([]);
    }
  }, [currentUser, reloadAccountData]);

  // Synchronize state changes to localStorage for active user ONLY when loaded data matches currentUser
  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'tasks', tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'subjects', subjects);
    }
  }, [subjects, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'notes', notes);
    }
  }, [notes, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'calendarEvents', calendarEvents);
    }
  }, [calendarEvents, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'filesMeta', files);
    }
  }, [files, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'achievements', achievements);
    }
  }, [achievements, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'notifications', notifications);
    }
  }, [notifications, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'settings', settings);
    }
  }, [settings, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'focusSessions', focusSessions);
    }
  }, [focusSessions, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'deletedItems', deletedItems);
    }
  }, [deletedItems, currentUser]);

  useEffect(() => {
    if (currentUser && loadedUserIdRef.current === currentUser.id) {
      saveAccountStorage(currentUser.id, 'studyPlans', studyPlans);
    }
  }, [studyPlans, currentUser]);

  // Apply theme class to documentElement immediately
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast System
  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      if (settings.notifications.timerSounds) {
        if (type === 'success') {
          soundFx.playSuccess();
        } else {
          soundFx.playClick();
        }
      }
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [settings.notifications.timerSounds]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Demo Mode Workspace Launcher
  const enterDemoMode = useCallback(() => {
    const demoAcc = accounts.find((a) => a.id === DEMO_USER_ID) || INITIAL_DEMO_ACCOUNT;
    loadedUserIdRef.current = demoAcc.id;
    reloadAccountData(demoAcc);
    setCurrentUser(demoAcc);
    showToast('Live Demo Active', 'Welcome to the Smart Study Planner live demo! Explore freely.', 'info');
  }, [accounts, reloadAccountData, showToast]);

  // Auth Functions
  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Django REST Framework Auth if server is reachable
    try {
      const res = await authService.login(cleanEmail, password || '');
      if (res.success && res.user) {
        const djangoUser: UserAccount = res.user;
        loadedUserIdRef.current = djangoUser.id;
        setCurrentUser(djangoUser);

        // Fetch cloud data from Django
        try {
          const [cloudTasks, cloudSubjects, cloudNotes, cloudEvents, cloudFiles] = await Promise.all([
            taskService.fetchTasks().catch(() => []),
            subjectService.fetchSubjects().catch(() => []),
            noteService.fetchNotes().catch(() => []),
            calendarService.fetchEvents().catch(() => []),
            fileService.fetchFiles().catch(() => [])
          ]);
          if (cloudTasks.length > 0) setTasks(cloudTasks);
          if (cloudSubjects.length > 0) setSubjects(cloudSubjects);
          if (cloudNotes.length > 0) setNotes(cloudNotes);
          if (cloudEvents.length > 0) setCalendarEvents(cloudEvents);
          if (cloudFiles.length > 0) setFiles(cloudFiles);
        } catch {
          reloadAccountData(djangoUser);
        }

        showToast('Signed In', `Welcome back, ${djangoUser.name}!`, 'success');
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Django sign-in failed, attempting local fallback:', err);
    }

    // 2. Local Fallback Auth (Resilient offline storage)
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!existing) {
      showToast('Account Not Found', 'No account found with this email. Please check your credentials or register.', 'warning');
      return { success: false, message: 'Account not found. Please register.' };
    }

    if (existing.passwordHash) {
      if (!password) {
        showToast('Password Required', 'Please enter your password.', 'error');
        return { success: false, message: 'Please enter your password.' };
      }
      const hashed = await hashPassword(password);
      if (hashed !== existing.passwordHash) {
        showToast('Invalid Password', 'The password entered is incorrect.', 'error');
        return { success: false, message: 'Incorrect password.' };
      }
    } else if (existing.id === DEMO_USER_ID) {
      // Demo account validation
      if (password && password !== 'StudyPlanner123!' && password.length < 4) {
        showToast('Invalid Credentials', 'Invalid password for this account.', 'error');
        return { success: false, message: 'Invalid password.' };
      }
    }

    loadedUserIdRef.current = existing.id;
    reloadAccountData(existing);
    setCurrentUser(existing);
    showToast('Signed In', `Welcome back, ${existing.name}!`, 'success');
    return { success: true };
  };


const register = async (
  name: string,
  email: string,
  password?: string
): Promise<{ success: boolean; message?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  if (!password) {
    return {
      success: false,
      message: 'Please enter a password.'
    };
  }

  // Register directly with Supabase
  try {
    const res = await authService.register(
      name.trim(),
      cleanEmail,
      password
    );

    // Never create a local account if Supabase registration fails
    if (!res.success) {
      const errorMessage =
        'error' in res
          ? res.error
          : 'Registration failed. Please try again.';

      showToast('Registration Failed', errorMessage, 'error');

      return {
        success: false,
        message: errorMessage
      };
    }

    if (!res.user) {
      return {
        success: false,
        message: 'Unable to retrieve your Supabase account.'
      };
    }

    const newUser: UserAccount = {
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      createdAt: res.user.createdAt
    };

    // Initialize a fresh workspace for this Supabase user
    saveAccountStorage(newUser.id, 'tasks', []);
    saveAccountStorage(newUser.id, 'subjects', []);
    saveAccountStorage(newUser.id, 'notes', []);
    saveAccountStorage(newUser.id, 'calendarEvents', []);
    saveAccountStorage(newUser.id, 'filesMeta', []);

    saveAccountStorage(
      newUser.id,
      'achievements',
      INITIAL_ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: false,
        progress: 0
      }))
    );

    saveAccountStorage(newUser.id, 'notifications', []);
    saveAccountStorage(newUser.id, 'focusSessions', []);
    saveAccountStorage(newUser.id, 'deletedItems', []);
    saveAccountStorage(newUser.id, 'studyPlans', []);

    const defaultAccountSettings: UserSettings = {
      ...INITIAL_SETTINGS,
      displayName: newUser.name,
      email: newUser.email,
      avatarUrl: undefined,
      hasCustomAvatar: false
    };

    saveAccountStorage(
      newUser.id,
      'settings',
      defaultAccountSettings
    );

    // Load the new user's empty workspace
    loadedUserIdRef.current = newUser.id;

    setTasks([]);
    setSubjects([]);
    setNotes([]);
    setCalendarEvents([]);
    setFiles([]);

    setAchievements(
      INITIAL_ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: false,
        progress: 0
      }))
    );

    setNotifications([]);
    setFocusSessions([]);
    setDeletedItems([]);
    setStudyPlans([]);
    setSettings(defaultAccountSettings);

    setAccounts((prev) => [
      ...prev.filter((a) => a.id !== newUser.id),
      newUser
    ]);

    setCurrentUser(newUser);

    showToast(
      'Account Created!',
      `Welcome to Smart Study Planner, ${newUser.name}!`,
      'success'
    );

    return { success: true };

  } catch (error) {
    console.error('Supabase registration error:', error);

    return {
      success: false,
      message: 'Account creation failed. Please try again.'
    };
  }
};


  const logout = () => {
    authService.logout().catch(() => {});
    loadedUserIdRef.current = null;
    setCurrentUser(null);
    setTasks([]);
    setSubjects([]);
    setNotes([]);
    setCalendarEvents([]);
    setFiles([]);
    setAchievements([]);
    setNotifications([]);
    setFocusSessions([]);
    setDeletedItems([]);
    setStudyPlans([]);
    showToast('Signed Out', 'You have been logged out of your session.', 'info');
  };

  // Safe migration helper for syncing local/offline data to Django REST Framework
  const migrateToDjango = async (): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in first to migrate data to Django.' };
    }

    const res = await migrationService.migrateUserDataToSupabase(currentUser.id);
    if (res.success) {
      showToast('Django Migration Completed! 🎉', 'Your local and offline data is safely synced to the Django backend.', 'success');
      return { success: true };
    }
    return { success: false, message: res.message || 'Migration failed' };
  };

  const migrateToSupabase = migrateToDjango; // Backward-compatibility alias

  // Task Actions
  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'userId'>): Task => {
    const newTask: Task = {
      ...newTaskData,
      id: generateUuid(),
      userId: activeUserId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task Created', `"${newTask.title}" scheduled.`, 'success');
    checkAndUnlockAchievement('ach-first-task');
    if (activeUserId && !isDemoUser) {
      taskService.createTask(newTask).catch(() => {});
    }
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString();
          }
          if (activeUserId && !isDemoUser) {
            taskService.updateTask(id, updates).catch(() => {});
          }
          return updated;
        }
        return t;
      })
    );
    showToast('Task Updated', 'Changes saved successfully.', 'info');
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Preserve any files attached to this task
    const attached = files.filter(
      (f) => f.taskId === id || (taskToDelete.attachmentIds && taskToDelete.attachmentIds.includes(f.id))
    );

    const deletedRecord: DeletedItem = {
      id: 'del-' + Date.now(),
      originalId: taskToDelete.id,
      userId: activeUserId,
      type: 'task',
      title: taskToDelete.title,
      itemData: taskToDelete,
      attachedFiles: attached.length > 0 ? attached : undefined,
      deletedAt: new Date().toISOString()
    };

    setDeletedItems((prev) => [deletedRecord, ...prev]);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (attached.length > 0) {
      setFiles((prev) => prev.filter((f) => !attached.some((af) => af.id === f.id)));
    }
    if (activeUserId && !isDemoUser) {
      taskService.deleteTask(id).catch(() => {});
    }
    showToast('Moved to Trash', `"${taskToDelete.title}" can be restored from Recently Deleted.`, 'warning');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted) {
            soundFx.playSuccess();
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#8B5CF6', '#6366F1', '#10B981']
            });
            showToast('Task Completed! 🎉', `Completed: ${t.title}`, 'success');
          }
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'todo',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  const reopenTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'todo', completedAt: undefined } : t))
    );
    showToast('Task Reopened', 'Task marked back as To Do.', 'info');
  };

  // Subject & Syllabus Topic Actions
  const addSubject = (newSubjectData: Omit<Subject, 'id' | 'userId'>): Subject => {
    const newSub: Subject = {
      ...newSubjectData,
      id: generateUuid(),
      userId: activeUserId,
      topics: newSubjectData.topics || []
    };
    setSubjects((prev) => [...prev, newSub]);
    showToast('Subject Added', `${newSub.name} created.`, 'success');
    if (activeUserId && !isDemoUser) {
      subjectService.createSubject(newSub).catch(() => {});
    }
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const target = updated.find((s) => s.id === id);
      if (target && activeUserId && !isDemoUser) {
        subjectService.updateSubject(id, updates).catch(() => {});
      }
      return updated;
    });
    showToast('Subject Updated', 'Changes saved successfully.', 'info');
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (activeUserId && !isDemoUser) {
      subjectService.deleteSubject(id).catch(() => {});
    }
    showToast('Subject Removed', `${sub?.name || 'Subject'} was deleted.`, 'warning');
  };

  const addTopicToSubject = (subjectId: string, title: string) => {
    if (!title.trim()) return;
    const newTopic: SyllabusTopic = {
      id: generateUuid(),
      title: title.trim(),
      completed: false
    };

    setSubjects((prev) => {
      const nextSubjects = prev.map((s) => {
        if (s.id === subjectId) {
          const updatedSubject = { ...s, topics: [...(s.topics || []), newTopic] };
          if (activeUserId && !isDemoUser) {
            subjectService.addTopic(subjectId, title.trim()).catch(() => {});
          }
          return updatedSubject;
        }
        return s;
      });
      return nextSubjects;
    });
    showToast('Syllabus Topic Added', `Added "${title}"`, 'success');
  };

  const toggleTopicCompletion = (subjectId: string, topicId: string) => {
    setSubjects((prev) => {
      const nextSubjects = prev.map((s) => {
        if (s.id === subjectId) {
          const currentTopic = (s.topics || []).find((t) => t.id === topicId);
          const nextCompleted = currentTopic ? !currentTopic.completed : true;
          const updatedTopics = (s.topics || []).map((t) =>
            t.id === topicId ? { ...t, completed: nextCompleted } : t
          );
          const updatedSubject = { ...s, topics: updatedTopics };
          if (activeUserId && !isDemoUser) {
            subjectService.toggleTopic(topicId, nextCompleted).catch(() => {});
          }
          return updatedSubject;
        }
        return s;
      });
      return nextSubjects;
    });
    soundFx.playClick();
  };

  const deleteTopicFromSubject = (subjectId: string, topicId: string) => {
    setSubjects((prev) => {
      const nextSubjects = prev.map((s) => {
        if (s.id === subjectId) {
          const updatedSubject = { ...s, topics: (s.topics || []).filter((t) => t.id !== topicId) };
          if (activeUserId && !isDemoUser) {
            subjectService.deleteTopic(topicId).catch(() => {});
          }
          return updatedSubject;
        }
        return s;
      });
      return nextSubjects;
    });
    showToast('Topic Removed', 'Syllabus item removed.', 'info');
  };

  // Note Actions
  const addNote = (newNoteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Note => {
    const now = new Date().toISOString().split('T')[0];
    const newNote: Note = {
      ...newNoteData,
      id: generateUuid(),
      userId: activeUserId,
      createdAt: now,
      updatedAt: now
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast('Note Saved', `"${newNote.title}" saved.`, 'success');
    if (activeUserId && !isDemoUser) {
      noteService.createNote(newNote).catch(() => {});
    }
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString().split('T')[0];
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n));
      const target = updated.find((n) => n.id === id);
      if (target && activeUserId && !isDemoUser) {
        noteService.updateNote(id, updates).catch(() => {});
      }
      return updated;
    });
    showToast('Note Updated', 'Changes saved.', 'info');
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    // Preserve any files attached to this note
    const attached = files.filter(
      (f) => f.noteId === id || (noteToDelete.attachmentIds && noteToDelete.attachmentIds.includes(f.id))
    );

    const deletedRecord: DeletedItem = {
      id: 'del-' + Date.now(),
      originalId: noteToDelete.id,
      userId: activeUserId,
      type: 'note',
      title: noteToDelete.title,
      itemData: noteToDelete,
      attachedFiles: attached.length > 0 ? attached : undefined,
      deletedAt: new Date().toISOString()
    };

    setDeletedItems((prev) => [deletedRecord, ...prev]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (attached.length > 0) {
      setFiles((prev) => prev.filter((f) => !attached.some((af) => af.id === f.id)));
    }
    if (activeUserId && !isDemoUser) {
      noteService.deleteNote(id).catch(() => {});
    }
    showToast('Note Moved to Trash', 'Can be restored from Recently Deleted.', 'warning');
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const toggleFavoriteNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  // Educational File Uploads (IndexedDB Integration)
  const uploadFile = async (
    file: File,
    optionsOrNoteId?: string | FileUploadOptions
  ): Promise<EducationalFileMeta> => {
    const options: FileUploadOptions =
      typeof optionsOrNoteId === 'string'
        ? { noteId: optionsOrNoteId }
        : optionsOrNoteId || {};

    const { noteId, taskId, subjectId, customTitle } = options;

    const id = generateUuid();
    const meta: EducationalFileMeta = {
      id,
      userId: activeUserId,
      name: customTitle ? `${customTitle}${file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : ''}` : file.name,
      customTitle: customTitle || file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      uploadDate: new Date().toISOString().split('T')[0],
      noteId,
      taskId,
      subjectId
    };

    const record: StoredFileRecord = {
      ...meta,
      blob: file
    };

    await saveFileToIndexedDB(record);
    setFiles((prev) => [meta, ...prev]);

    // If user is logged in to Django backend, sync upload
    if (activeUserId && !isDemoUser) {
      fileService.uploadFile(file, options).catch(() => {});
    }

    // If attached to a note, link in note
    if (noteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, attachmentIds: [...(n.attachmentIds || []), id] }
            : n
        )
      );
    }

    // If attached to a task, link in task
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, attachmentIds: [...(t.attachmentIds || []), id] }
            : t
        )
      );
    }

    showToast('File Uploaded', `${meta.name} saved persistently in IndexedDB.`, 'success');
    return meta;
  };

  const downloadFile = async (fileId: string): Promise<void> => {
    const record = await getFileFromIndexedDB(fileId);
    if (!record || !record.blob) {
      showToast('File Not Found', 'Could not locate file in local storage.', 'error');
      return;
    }

    const url = URL.createObjectURL(record.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Downloading', `Starting download for ${record.name}`, 'info');
  };

  const getFileBlob = async (fileId: string): Promise<Blob | undefined> => {
    const record = await getFileFromIndexedDB(fileId);
    return record?.blob;
  };

  const renameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName.trim() } : f))
    );
    showToast('File Renamed', `Renamed to ${newName}`, 'info');
  };

  const deleteFile = (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId);
    if (!fileToDelete) return;

    const deletedRecord: DeletedItem = {
      id: 'del-' + Date.now(),
      originalId: fileToDelete.id,
      userId: activeUserId,
      type: 'file',
      title: fileToDelete.name,
      itemData: fileToDelete,
      deletedAt: new Date().toISOString()
    };

    setDeletedItems((prev) => [deletedRecord, ...prev]);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeUserId && !isDemoUser) {
      fileService.deleteFile(fileId).catch(() => {});
    }
    showToast('File Moved to Trash', 'Can be restored from Recently Deleted.', 'warning');
  };

  // Calendar / Events
  const addCalendarEvent = (newEventData: Omit<CalendarEvent, 'id' | 'userId'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: generateUuid(),
      userId: activeUserId
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    showToast('Event Scheduled', `${newEvent.title} added to calendar.`, 'success');
    if (activeUserId && !isDemoUser) {
      calendarService.createEvent(newEvent).catch(() => {});
    }
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    if (activeUserId && !isDemoUser) {
      calendarService.updateEvent(id, updates).catch(() => {});
    }
    showToast('Event Updated', 'Changes saved to schedule.', 'info');
  };

  const deleteCalendarEvent = (id: string) => {
    const ev = calendarEvents.find((e) => e.id === id);
    if (ev) {
      const deletedRecord: DeletedItem = {
        id: 'del-' + Date.now(),
        originalId: ev.id,
        userId: activeUserId,
        type: 'event',
        title: ev.title,
        itemData: ev,
        deletedAt: new Date().toISOString()
      };
      setDeletedItems((prev) => [deletedRecord, ...prev]);
    }
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    if (activeUserId && !isDemoUser) {
      calendarService.deleteEvent(id).catch(() => {});
    }
    showToast('Event Removed', 'Event deleted from calendar.', 'info');
  };

  // Trash Actions (Supports Task, Note, File, Event with attachments)
  const restoreItem = (deletedId: string) => {
    const record = deletedItems.find((d) => d.id === deletedId);
    if (!record) return;

    if (record.type === 'task') {
      setTasks((prev) => [record.itemData as Task, ...prev]);
      if (record.attachedFiles && record.attachedFiles.length > 0) {
        setFiles((prev) => [...record.attachedFiles!, ...prev]);
      }
      showToast('Task Restored', `"${record.title}" and attached files restored.`, 'success');
    } else if (record.type === 'note') {
      setNotes((prev) => [record.itemData as Note, ...prev]);
      if (record.attachedFiles && record.attachedFiles.length > 0) {
        setFiles((prev) => [...record.attachedFiles!, ...prev]);
      }
      showToast('Note Restored', `"${record.title}" and attached files restored.`, 'success');
    } else if (record.type === 'file') {
      setFiles((prev) => [record.itemData as EducationalFileMeta, ...prev]);
      showToast('File Restored', `"${record.title}" restored.`, 'success');
    } else if (record.type === 'event') {
      setCalendarEvents((prev) => [record.itemData as CalendarEvent, ...prev]);
      showToast('Event Restored', `"${record.title}" restored to calendar.`, 'success');
    }

    setDeletedItems((prev) => prev.filter((d) => d.id !== deletedId));
  };

  const permanentlyDeleteItem = async (deletedId: string) => {
    const record = deletedItems.find((d) => d.id === deletedId);
    if (!record) return;

    if (record.type === 'file') {
      await deleteFileFromIndexedDB(record.originalId);
    }

    // If attached files exist on deleted task/note, delete them from IndexedDB
    if (record.attachedFiles && record.attachedFiles.length > 0) {
      for (const af of record.attachedFiles) {
        await deleteFileFromIndexedDB(af.id);
      }
    }

    setDeletedItems((prev) => prev.filter((d) => d.id !== deletedId));
    showToast('Permanently Erased', 'Item and any attached files deleted forever.', 'error');
  };

  const emptyTrash = async () => {
    const count = deletedItems.length;
    for (const item of deletedItems) {
      if (item.type === 'file') {
        await deleteFileFromIndexedDB(item.originalId);
      }
      if (item.attachedFiles) {
        for (const af of item.attachedFiles) {
          await deleteFileFromIndexedDB(af.id);
        }
      }
    }
    setDeletedItems([]);
    showToast('Trash Emptied', `Permanently removed ${count} items.`, 'info');
  };

  // Focus & Study Plans
  const recordFocusSession = (sessionData: Omit<FocusSession, 'id' | 'userId'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: generateUuid(),
      userId: activeUserId
    };
    setFocusSessions((prev) => [newSession, ...prev]);

    if (sessionData.type === 'focus') {
      const focusCount = focusSessions.filter((s) => s.type === 'focus').length + 1;
      if (focusCount >= 20) {
        checkAndUnlockAchievement('ach-focus-master');
      }
    }
  };

  const saveStudyPlan = (plan: GeneratedStudyPlan) => {
    setStudyPlans((prev) => [plan, ...prev]);
    showToast('Study Plan Saved', 'Added to your active study plans.', 'success');
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans((prev) => prev.filter((p) => p.id !== id));
    showToast('Plan Removed', 'Study plan deleted.', 'info');
  };

  // Convert AI Study Plan sessions into real Tasks and Calendar Events
  const convertPlanToTasksAndEvents = (plan: GeneratedStudyPlan) => {
    let tasksAdded = 0;
    let eventsAdded = 0;

    const baseSubjectId = plan.selectedSubjects[0] || (subjects[0]?.id ?? 'sub-default');

    plan.weeklySchedule.forEach((daySchedule, dIdx) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (dIdx + 1));
      const dateStr = targetDate.toISOString().split('T')[0];

      daySchedule.sessions.forEach((s) => {
        if (s.type !== 'break') {
          // Add as Task
          addTask({
            title: `[${s.subject}] ${s.topic}`,
            description: `Generated study block (${s.durationMinutes} min). Planned focus time.`,
            subjectId: baseSubjectId,
            priority: s.type === 'deep_work' ? 'high' : 'medium',
            status: 'todo',
            dueDate: dateStr,
            dueTime: s.time.includes('AM') || s.time.includes('PM') ? '10:00' : s.time,
            estimatedMinutes: s.durationMinutes,
            category: 'Study Session',
            tags: ['ai-planner', s.type]
          });
          tasksAdded++;

          // Add as Calendar Event
          addCalendarEvent({
            title: `${s.subject}: ${s.topic}`,
            subjectId: baseSubjectId,
            date: dateStr,
            time: '10:00',
            category: 'study_session',
            description: `Planned duration: ${s.durationMinutes} minutes.`
          });
          eventsAdded++;
        }
      });
    });

    soundFx.playSuccess();
    showToast(
      'Converted to Schedule! 📅',
      `Created ${tasksAdded} study tasks and ${eventsAdded} calendar blocks from your AI plan.`,
      'success'
    );
  };

  // Achievements
  const checkAndUnlockAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === achievementId && !ach.unlocked) {
          const unlockedAch = {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString().split('T')[0],
            progress: ach.target
          };
          setUnlockedAchievementModal(unlockedAch);
          soundFx.playChime();
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#8B5CF6', '#EC4899', '#10B981']
          });
          return unlockedAch;
        }
        return ach;
      })
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Read', 'All notifications caught up.', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', '', 'info');
  };

  // Profile Photo Upload (IndexedDB)
  const uploadProfilePhoto = async (file: File) => {
    if (!currentUser) return;
    await saveProfilePhotoToIndexedDB(currentUser.id, file);
    const objectUrl = URL.createObjectURL(file);
    setSettings((prev) => ({
      ...prev,
      avatarUrl: objectUrl,
      hasCustomAvatar: true
    }));
    showToast('Profile Photo Updated', 'Avatar saved persistently.', 'success');
  };

  const removeProfilePhoto = async () => {
    if (!currentUser) return;
    await deleteProfilePhotoFromIndexedDB(currentUser.id);
    setSettings((prev) => ({
      ...prev,
      avatarUrl: undefined,
      hasCustomAvatar: false
    }));
    showToast('Profile Photo Removed', 'Reverted to default avatar.', 'info');
  };

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });
    showToast('Preferences Saved', 'Your settings have been updated.', 'success');
  };

  const clearMyWorkspaceData = async () => {
    if (!currentUser) return;
    const uid = currentUser.id;

    // Delete all user files from IndexedDB
    try {
      const userFiles = await getUserFilesFromIndexedDB(uid);
      for (const f of userFiles) {
        await deleteFileFromIndexedDB(f.id);
      }
    } catch (err) {
      console.error('Error clearing files from IndexedDB', err);
    }

    // Reset local state to clean workspace
    setTasks([]);
    setSubjects([]);
    setNotes([]);
    setCalendarEvents([]);
    setFiles([]);
    setFocusSessions([]);
    setDeletedItems([]);
    setStudyPlans([]);
    setNotifications([]);
    setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, progress: 0 })));

    // Clear local storage keys for this user only
    ['tasks', 'subjects', 'notes', 'calendarEvents', 'filesMeta', 'achievements', 'notifications', 'focusSessions', 'deletedItems', 'studyPlans'].forEach(
      (k) => localStorage.removeItem(getStorageKey(uid, k))
    );

    showToast('Workspace Cleared', 'All records for your account have been wiped cleanly.', 'info');
  };

  const resetAllDataToDefault = () => {
    clearMyWorkspaceData();
  };

  // Computed Metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;

    const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;

    const focusTotalMin = focusSessions
      .filter((s) => s.type === 'focus')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const todayFocusMin = focusSessions
      .filter((s) => s.type === 'focus' && s.completedAt.startsWith(todayStr))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Syllabus topics count
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach((s) => {
      (s.topics || []).forEach((top) => {
        totalTopics++;
        if (top.completed) completedTopics++;
      });
    });

    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      todayTasksCount: todayTasks.length,
      todayCompletedCount: todayCompleted,
      totalFocusHours: Number((focusTotalMin / 60).toFixed(1)),
      todayFocusMinutes: todayFocusMin,
      studyStreakDays: isDemoUser ? 7 : (focusSessions.length > 0 ? 1 : 0),
      overallProgress,
      totalFilesCount: files.length,
      totalTopicsCount: totalTopics,
      completedTopicsCount: completedTopics
    };
  }, [tasks, focusSessions, subjects, files, isDemoUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        accounts,
        login,
        register,
        logout,
        isDemoUser,
        enterDemoMode,
        isSupabaseConnected,
        migrateToSupabase,
        isDjangoConnected,
        migrateToDjango,
        tasks,
        subjects,
        notes,
        calendarEvents,
        files,
        achievements,
        notifications,
        settings,
        focusSessions,
        deletedItems,
        studyPlans,
        toasts,
        isSearchOpen,
        setIsSearchOpen,
        isQuickTaskOpen,
        setIsQuickTaskOpen,
        unlockedAchievementModal,
        setUnlockedAchievementModal,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        reopenTask,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopicToSubject,
        toggleTopicCompletion,
        deleteTopicFromSubject,
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
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        restoreItem,
        permanentlyDeleteItem,
        emptyTrash,
        recordFocusSession,
        saveStudyPlan,
        deleteStudyPlan,
        convertPlanToTasksAndEvents,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        checkAndUnlockAchievement,
        updateSettings,
        uploadProfilePhoto,
        removeProfilePhoto,
        resetAllDataToDefault,
        clearMyWorkspaceData,
        showToast,
        removeToast,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
