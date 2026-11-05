
import { supabase } from '../lib/supabase';
import type { Task } from '../types';

const mapTask = (t: any): Task => ({
  id: t.id,
  userId: t.user_id,
  title: t.title,
  description: t.description || '',
  subjectId: t.subject_id || '',
  priority: t.priority,
  status: t.status,
  dueDate: t.due_date || '',
  dueTime: t.due_time || '',
  estimatedMinutes: t.estimated_minutes || 45,
  actualMinutes: t.actual_minutes || 0,
  tags: t.tags || [],
  attachmentIds: t.attachment_ids || [],
  completedAt: t.completed_at || undefined,
  createdAt: t.created_at
    ? t.created_at.split('T')[0]
    : new Date().toISOString().split('T')[0]
});

export const taskService = {
  async fetchTasks(params?: {
    status?: string;
    priority?: string;
    subject?: string;
  }): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.status) query = query.eq('status', params.status);
    if (params?.priority) query = query.eq('priority', params.priority);
    if (params?.subject) query = query.eq('subject_id', params.subject);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapTask);
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const payload = {
      user_id: authData.user.id,
      title: task.title,
      description: task.description || '',
      subject_id: task.subjectId || null,
      due_date: task.dueDate || null,
      due_time: task.dueTime || null,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      estimated_minutes: task.estimatedMinutes || 45,
      actual_minutes: task.actualMinutes || 0,
      tags: task.tags || [],
      attachment_ids: task.attachmentIds || [],
      completed_at: task.completedAt || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapTask(data);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId || null;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.dueTime !== undefined) payload.due_time = updates.dueTime || null;
    if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;
    if (updates.actualMinutes !== undefined) payload.actual_minutes = updates.actualMinutes;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.attachmentIds !== undefined) payload.attachment_ids = updates.attachmentIds;
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt || null;

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    const { data: current, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const completed = current.status !== 'completed';

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: completed ? 'completed' : 'todo',
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTask(data);
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
