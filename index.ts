export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  passwordHash?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  subjectId: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  category?: string;
  tags?: string[];
  attachmentIds?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  description: string;
  color: string; // hex
  icon: string; // Lucide icon identifier
  targetHoursPerWeek: number;
  instructor?: string;
  room?: string;
  topics?: SyllabusTopic[];
}

export type NoteCategory = 'General' | 'DSA' | 'DBMS' | 'Exams' | 'Resources';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subjectId: string;
  category: NoteCategory;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  attachmentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EducationalFileMeta {
  id: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  noteId?: string;
  taskId?: string;
  subjectId?: string;
  customTitle?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export type CalendarEventCategory = 'exam' | 'assignment' | 'study_session' | 'lecture' | 'other';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  subjectId?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  endTime?: string;
  category: CalendarEventCategory;
  room?: string;
  weightage?: string;
  description?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  durationMinutes: number;
  subjectId?: string;
  taskId?: string;
  completedAt: string;
  type: 'focus' | 'short_break' | 'long_break';
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'tasks' | 'focus' | 'syllabus' | 'general';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface DeletedItem {
  id: string;
  originalId: string;
  userId: string;
  type: 'task' | 'note' | 'file' | 'event';
  title: string;
  itemData: Task | Note | EducationalFileMeta | CalendarEvent;
  attachedFiles?: EducationalFileMeta[];
  deletedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'task' | 'goal' | 'exam' | 'achievement';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UserSettings {
  displayName: string;
  email: string;
  avatarUrl?: string; // or base64 / blob URL
  hasCustomAvatar?: boolean;
  bio: string;
  theme: 'light' | 'dark';
  accentColor: string;
  layoutMode: 'comfortable' | 'compact';
  notifications: {
    taskReminders: boolean;
    examReminders: boolean;
    dailyStudyReminder: boolean;
    browserNotifications: boolean;
    timerSounds: boolean;
  };
  studyPreferences: {
    dailyGoalHours: number;
    defaultFocusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export interface GeneratedStudyPlan {
  id: string;
  userId: string;
  goal: string;
  examDate: string;
  selectedSubjects: string[];
  hoursPerDay: number;
  difficulty: 'beginner' | 'intermediate' | 'intensive';
  preferredTime: string;
  createdAt: string;
  weeklySchedule: {
    day: string;
    sessions: {
      time: string;
      subject: string;
      topic: string;
      durationMinutes: number;
      type: 'deep_work' | 'practice' | 'revision' | 'break';
    }[];
  }[];
  revisionTips: string[];
  priorityChecklist: string[];
}
