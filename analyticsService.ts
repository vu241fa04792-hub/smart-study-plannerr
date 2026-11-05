
import { supabase } from '../lib/supabase';
import type { FocusSession } from '../types';

export interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  todayTasksCount: number;
  todayCompletedCount: number;
  totalFocusHours: number;
  todayFocusMinutes: number;
  studyStreakDays: number;
  longestStreakDays?: number;
  overallProgress: number;
  totalFilesCount: number;
  totalTopicsCount: number;
  completedTopicsCount: number;
}

export const analyticsService = {
  async fetchMetrics(): Promise<AnalyticsMetrics> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const userId = authData.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [
      tasksRes,
      sessionsRes,
      filesRes,
      topicsRes,
      streakRes
    ] = await Promise.all([
      supabase.from('tasks').select('id, status, due_date').eq('user_id', userId),
      supabase.from('focus_sessions').select('duration_minutes, timestamp').eq('user_id', userId),
      supabase.from('study_files').select('id').eq('user_id', userId),
      supabase.from('syllabus_items').select('id, completed').eq('user_id', userId),
      supabase.from('study_streaks').select('*').eq('user_id', userId).maybeSingle()
    ]);

    const results = [tasksRes, sessionsRes, filesRes, topicsRes, streakRes];

    for (const result of results) {
      if (result.error) throw result.error;
    }

    const tasks = tasksRes.data || [];
    const sessions = sessionsRes.data || [];
    const files = filesRes.data || [];
    const topics = topicsRes.data || [];

    const completedTasks = tasks.filter(
      (task: any) => task.status === 'completed'
    ).length;

    const todayTasks = tasks.filter(
      (task: any) => task.due_date === today
    );

    const todaySessions = sessions.filter(
      (session: any) =>
        session.timestamp?.startsWith(today)
    );

    const totalFocusMinutes = sessions.reduce(
      (sum: number, session: any) =>
        sum + Number(session.duration_minutes || 0),
      0
    );

    const completedTopics = topics.filter(
      (topic: any) => topic.completed
    ).length;

    return {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks: tasks.length - completedTasks,
      todayTasksCount: todayTasks.length,
      todayCompletedCount: todayTasks.filter(
        (task: any) => task.status === 'completed'
      ).length,
      totalFocusHours: Number((totalFocusMinutes / 60).toFixed(1)),
      todayFocusMinutes: todaySessions.reduce(
        (sum: number, session: any) =>
          sum + Number(session.duration_minutes || 0),
        0
      ),
      studyStreakDays: streakRes.data?.current_streak || 0,
      longestStreakDays: streakRes.data?.longest_streak || 0,
      overallProgress: tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0,
      totalFilesCount: files.length,
      totalTopicsCount: topics.length,
      completedTopicsCount: completedTopics
    };
  },

  async recordFocusSession(session: {
    durationMinutes: number;
    sessionType: string;
    subjectId?: string;
    taskId?: string;
    notes?: string;
  }): Promise<FocusSession> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: authData.user.id,
        duration_minutes: session.durationMinutes,
        session_type: session.sessionType,
        subject_id: session.subjectId || null,
        task_id: session.taskId || null,
        completed: true,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      durationMinutes: data.duration_minutes,
      subjectId: data.subject_id || undefined,
      taskId: data.task_id || undefined,
      completedAt: data.timestamp,
      type: data.session_type
    };
  }
};
