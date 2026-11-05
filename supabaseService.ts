
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toValidUuid } from '../utils/uuid';
import type {
  Task,
  Subject,
  Note,
  CalendarEvent,
  Achievement,
  AppNotification,
  UserSettings,
  FocusSession,
  GeneratedStudyPlan,
  EducationalFileMeta
} from '../types';

export interface SupabaseUserData {
  tasks: Task[];
  subjects: Subject[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
  files: EducationalFileMeta[];
  achievements: Achievement[];
  notifications: AppNotification[];
  settings?: UserSettings;
  focusSessions: FocusSession[];
  studyPlans: GeneratedStudyPlan[];
}

const isReady = () => isSupabaseConfigured;

const checkError = (error: any) => {
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// AUTH
// -----------------------------------------------------------------------------

export const supabaseSignUp = async (
  name: string,
  email: string,
  password: string
) => {
  if (!isReady()) throw new Error('Supabase is not configured');

  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { name: name.trim(), full_name: name.trim() }
    }
  });
};

export const supabaseSignIn = async (
  email: string,
  password: string
) => {
  if (!isReady()) throw new Error('Supabase is not configured');

  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
};

export const supabaseSignOut = async () => {
  return supabase.auth.signOut();
};

export const supabaseResetPassword = async (email: string) => {
  if (!isReady()) throw new Error('Supabase is not configured');

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`
  });
};

export const supabaseGetSession = async () => {
  if (!isReady()) return null;

  const { data, error } = await supabase.auth.getSession();
  checkError(error);
  return data.session;
};

// -----------------------------------------------------------------------------
// FETCH USER DATA
// -----------------------------------------------------------------------------

export const fetchUserDataFromSupabase = async (
  userId: string
): Promise<SupabaseUserData | null> => {
  if (!isReady() || !userId) return null;

  try {
    const [
      tasksRes,
      subjectsRes,
      syllabusRes,
      notesRes,
      filesRes,
      eventsRes,
      sessionsRes,
      plansRes,
      achievementsRes,
      notificationsRes
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('syllabus_items').select('*').eq('user_id', userId),
      supabase.from('notes').select('*').eq('user_id', userId),
      supabase.from('study_files').select('*').eq('user_id', userId),
      supabase.from('calendar_events').select('*').eq('user_id', userId),
      supabase.from('focus_sessions').select('*').eq('user_id', userId),
      supabase.from('study_plans').select('*').eq('user_id', userId),
      supabase.from('achievements').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId)
    ]);

    [
      tasksRes,
      subjectsRes,
      syllabusRes,
      notesRes,
      filesRes,
      eventsRes,
      sessionsRes,
      plansRes,
      achievementsRes,
      notificationsRes
    ].forEach((result) => checkError(result.error));

    const syllabusBySubject: Record<string, any[]> = {};

    (syllabusRes.data || []).forEach((item: any) => {
      if (!syllabusBySubject[item.subject_id]) {
        syllabusBySubject[item.subject_id] = [];
      }

      syllabusBySubject[item.subject_id].push({
        id: item.id,
        title: item.title,
        completed: Boolean(item.completed),
        notes: item.notes || ''
      });
    });

    const subjects: Subject[] = (subjectsRes.data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      name: s.name,
      code: s.code || '',
      description: s.description || '',
      color: s.color || '#8B5CF6',
      icon: s.icon || 'BookOpen',
      targetHoursPerWeek: Number(s.weekly_target_hours || 4),
      instructor: s.professor || '',
      room: s.room || '',
      topics: syllabusBySubject[s.id] || []
    }));

    const tasks: Task[] = (tasksRes.data || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      subjectId: t.subject_id || '',
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'medium',
      status: t.status || 'todo',
      dueDate: t.due_date,
      dueTime: t.due_time || '',
      estimatedMinutes: t.estimated_minutes || 0,
      actualMinutes: t.actual_minutes || 0,
      tags: t.tags || [],
      attachmentIds: t.attachment_ids || [],
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined
    }));

    const notes: Note[] = (notesRes.data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      subjectId: n.subject_id || '',
      category: n.category || 'General',
      title: n.title,
      content: n.content || '',
      isPinned: Boolean(n.is_pinned),
      isFavorite: Boolean(n.is_favorite),
      tags: n.tags || [],
      attachmentIds: n.attachment_ids || [],
      createdAt: n.created_at,
      updatedAt: n.updated_at || n.created_at
    }));

    const files: EducationalFileMeta[] = (filesRes.data || []).map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      name: f.file_name,
      customTitle: f.file_name,
      size: Number(f.file_size || 0),
      type: f.file_type || 'application/octet-stream',
      uploadDate: f.created_at,
      subjectId: f.subject_id || '',
      isDeleted: false
    }));

    const calendarEvents: CalendarEvent[] = (eventsRes.data || []).map((e: any) => ({
      id: e.id,
      userId: e.user_id,
      subjectId: e.subject_id || '',
      title: e.title,
      description: e.description || '',
      category: e.event_type || 'other',
      date: e.date,
      time: e.start_time || '',
      endTime: e.end_time || '',
      room: e.location || '',
      weightage: e.weightage || ''
    }));

    const focusSessions: FocusSession[] = (sessionsRes.data || []).map((fs: any) => ({
      id: fs.id,
      userId: fs.user_id,
      subjectId: fs.subject_id || undefined,
      taskId: fs.task_id || undefined,
      durationMinutes: fs.duration_minutes || 0,
      type: fs.session_type === 'pomodoro' ? 'focus' : fs.session_type,
      completedAt: fs.timestamp || fs.created_at
    }));

    const studyPlans: GeneratedStudyPlan[] = (plansRes.data || []).map((sp: any) => ({
      id: sp.id,
      userId: sp.user_id,
      goal: sp.title || sp.exam_name || 'Exam Preparation',
      examDate: sp.exam_date,
      selectedSubjects: sp.selected_subjects || [],
      hoursPerDay: Number(sp.available_hours_per_day || 4),
      difficulty: sp.difficulty || 'intermediate',
      preferredTime: sp.preferred_time || 'evening',
      createdAt: sp.created_at,
      weeklySchedule: sp.days || [],
      revisionTips: sp.revision_tips || [],
      priorityChecklist: sp.priority_checklist || []
    }));

    const achievements: Achievement[] = (achievementsRes.data || []).map((a: any) => ({
      id: a.achievement_key || a.id,
      userId: a.user_id,
      title: a.title,
      description: a.description || '',
      icon: a.icon || 'Trophy',
      category: a.category || 'general',
      unlocked: Boolean(a.unlocked),
      unlockedAt: a.unlocked_at || undefined,
      progress: a.progress || 0,
      target: a.max_progress || 1
    }));

    const notifications: AppNotification[] = (notificationsRes.data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type || 'task',
      read: Boolean(n.read),
      actionUrl: n.action_url || undefined,
      timestamp: n.created_at
    }));

    return {
      tasks,
      subjects,
      notes,
      calendarEvents,
      files,
      achievements,
      notifications,
      focusSessions,
      studyPlans
    };
  } catch (error) {
    console.error('Failed to fetch Supabase data:', error);
    throw error;
  }
};

// -----------------------------------------------------------------------------
// TASKS
// -----------------------------------------------------------------------------

export const syncTaskToSupabase = async (task: Task, userId: string) => {
  const { error } = await supabase.from('tasks').upsert({
    id: toValidUuid(task.id),
    user_id: userId,
    subject_id: task.subjectId ? toValidUuid(task.subjectId) : null,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate || null,
    due_time: task.dueTime || null,
    estimated_minutes: task.estimatedMinutes || 0,
    actual_minutes: task.actualMinutes || 0,
    tags: task.tags || [],
    attachment_ids: task.attachmentIds || [],
    created_at: task.createdAt,
    completed_at: task.completedAt || null
  });

  checkError(error);
};

export const deleteTaskFromSupabase = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', toValidUuid(taskId));

  checkError(error);
};

// -----------------------------------------------------------------------------
// SUBJECTS AND SYLLABUS
// -----------------------------------------------------------------------------

export const syncSubjectToSupabase = async (
  subject: Subject,
  userId: string
) => {
  const subjectId = toValidUuid(subject.id);

  const { error } = await supabase.from('subjects').upsert({
    id: subjectId,
    user_id: userId,
    name: subject.name,
    code: subject.code || '',
    description: subject.description || '',
    color: subject.color || '#8B5CF6',
    icon: subject.icon || 'BookOpen',
    professor: subject.instructor || '',
    room: subject.room || '',
    weekly_target_hours: subject.targetHoursPerWeek || 4
  });

  checkError(error);

  for (const topic of subject.topics || []) {
    const { error: topicError } = await supabase
      .from('syllabus_items')
      .upsert({
        id: toValidUuid(topic.id),
        user_id: userId,
        subject_id: subjectId,
        title: topic.title,
        completed: topic.completed,
        notes: topic.notes || ''
      });

    checkError(topicError);
  }
};

export const deleteSubjectFromSupabase = async (subjectId: string) => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', toValidUuid(subjectId));

  checkError(error);
};

// -----------------------------------------------------------------------------
// NOTES
// -----------------------------------------------------------------------------

export const syncNoteToSupabase = async (note: Note, userId: string) => {
  const { error } = await supabase.from('notes').upsert({
    id: toValidUuid(note.id),
    user_id: userId,
    subject_id: note.subjectId ? toValidUuid(note.subjectId) : null,
    title: note.title,
    content: note.content || '',
    category: note.category || 'General',
    tags: note.tags || [],
    is_pinned: note.isPinned,
    is_favorite: note.isFavorite,
    attachment_ids: note.attachmentIds || [],
    created_at: note.createdAt,
    updated_at: note.updatedAt
  });

  checkError(error);
};

export const deleteNoteFromSupabase = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', toValidUuid(noteId));

  checkError(error);
};

// -----------------------------------------------------------------------------
// CALENDAR EVENTS
// -----------------------------------------------------------------------------

export const syncCalendarEventToSupabase = async (
  event: CalendarEvent,
  userId: string
) => {
  const { error } = await supabase.from('calendar_events').upsert({
    id: toValidUuid(event.id),
    user_id: userId,
    subject_id: event.subjectId ? toValidUuid(event.subjectId) : null,
    title: event.title,
    description: event.description || '',
    event_type: event.category || 'other',
    date: event.date,
    start_time: event.time || null,
    end_time: event.endTime || null,
    location: event.room || '',
    weightage: event.weightage || ''
  });

  checkError(error);
};

export const deleteCalendarEventFromSupabase = async (eventId: string) => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', toValidUuid(eventId));

  checkError(error);
};

// -----------------------------------------------------------------------------
// FOCUS SESSIONS
// -----------------------------------------------------------------------------

export const syncFocusSessionToSupabase = async (
  session: FocusSession,
  userId: string
) => {
  const { error } = await supabase.from('focus_sessions').upsert({
    id: toValidUuid(session.id),
    user_id: userId,
    subject_id: session.subjectId ? toValidUuid(session.subjectId) : null,
    task_id: session.taskId ? toValidUuid(session.taskId) : null,
    duration_minutes: session.durationMinutes,
    session_type: session.type === 'focus' ? 'pomodoro' : session.type,
    completed: true,
    timestamp: session.completedAt
  });

  checkError(error);
};

// -----------------------------------------------------------------------------
// STORAGE FILES
// -----------------------------------------------------------------------------

export const uploadFileToSupabaseStorage = async (
  file: File,
  userId: string,
  meta: EducationalFileMeta
): Promise<string> => {
  const fileId = toValidUuid(meta.id);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${fileId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('study-files')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  checkError(uploadError);

  const { error: insertError } = await supabase
    .from('study_files')
    .upsert({
      id: fileId,
      user_id: userId,
      subject_id: meta.subjectId ? toValidUuid(meta.subjectId) : null,
      file_name: meta.customTitle || meta.name,
      file_path: storagePath,
      file_type: meta.type,
      file_size: meta.size
    });

  if (insertError) {
    await supabase.storage.from('study-files').remove([storagePath]);
    throw insertError;
  }

  return storagePath;
};

export const deleteFileFromSupabaseStorage = async (
  meta: EducationalFileMeta,
  _userId: string
) => {
  const { data, error } = await supabase
    .from('study_files')
    .select('file_path')
    .eq('id', toValidUuid(meta.id))
    .single();

  checkError(error);
  if (!data) {
  throw new Error('File record not found');
}

  const { error: storageError } = await supabase.storage
    .from('study-files')
    .remove([data.file_path]);

  checkError(storageError);

  const { error: deleteError } = await supabase
    .from('study_files')
    .delete()
    .eq('id', toValidUuid(meta.id));

  checkError(deleteError);
};

// -----------------------------------------------------------------------------
// LOCAL DATA MIGRATION
// -----------------------------------------------------------------------------

export const migrateLocalDataToSupabase = async (
  userId: string,
  data: {
    tasks: Task[];
    subjects: Subject[];
    notes: Note[];
    calendarEvents: CalendarEvent[];
    settings: UserSettings;
    focusSessions: FocusSession[];
    studyPlans: GeneratedStudyPlan[];
  }
): Promise<{ success: boolean; error?: string }> => {
  if (!isReady() || !userId) {
    return {
      success: false,
      error: 'Supabase is not configured or user is invalid'
    };
  }

  try {
    for (const subject of data.subjects) {
      await syncSubjectToSupabase(subject, userId);
    }

    for (const task of data.tasks) {
      await syncTaskToSupabase(task, userId);
    }

    for (const note of data.notes) {
      await syncNoteToSupabase(note, userId);
    }

    for (const event of data.calendarEvents) {
      await syncCalendarEventToSupabase(event, userId);
    }

    for (const session of data.focusSessions) {
      await syncFocusSessionToSupabase(session, userId);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Migration to Supabase failed:', error);

    return {
      success: false,
      error: error?.message || 'Migration failed'
    };
  }
};
