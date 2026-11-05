
import { supabase } from '../lib/supabase';
import type { Subject, SyllabusTopic } from '../types';

const mapTopic = (t: any): SyllabusTopic => ({
  id: t.id,
  title: t.title,
  completed: Boolean(t.completed),
  notes: t.notes || ''
});

const mapSubject = (s: any, topics: any[] = []): Subject => ({
  id: s.id,
  userId: s.user_id,
  name: s.name,
  code: s.code || '',
  description: s.description || '',
  color: s.color || '#8B5CF6',
  icon: s.icon || 'BookOpen',
  instructor: s.professor || '',
  room: s.room || '',
  targetHoursPerWeek: Number(s.weekly_target_hours || 4),
  topics: topics.map(mapTopic)
});

export const subjectService = {
  async fetchSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, syllabus_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((s: any) =>
      mapSubject(s, s.syllabus_items || [])
    );
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: authData.user.id,
        name: subject.name,
        code: subject.code || '',
        description: subject.description || '',
        color: subject.color || '#8B5CF6',
        icon: subject.icon || 'BookOpen',
        professor: subject.instructor || '',
        room: subject.room || '',
        weekly_target_hours: subject.targetHoursPerWeek || 4
      })
      .select()
      .single();

    if (error) throw error;
    return mapSubject(data);
  },

  async updateSubject(
    id: string,
    updates: Partial<Subject>
  ): Promise<void> {
    const payload: Record<string, any> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.instructor !== undefined) payload.professor = updates.instructor;
    if (updates.room !== undefined) payload.room = updates.room;

    if (updates.targetHoursPerWeek !== undefined) {
      payload.weekly_target_hours = updates.targetHoursPerWeek;
    }

    const { error } = await supabase
      .from('subjects')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addTopic(
    subjectId: string,
    title: string
  ): Promise<SyllabusTopic> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const { data, error } = await supabase
      .from('syllabus_items')
      .insert({
        user_id: authData.user.id,
        subject_id: subjectId,
        title,
        completed: false,
        notes: ''
      })
      .select()
      .single();

    if (error) throw error;
    return mapTopic(data);
  },

  async toggleTopic(
    topicId: string,
    completed: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('syllabus_items')
      .update({ completed })
      .eq('id', topicId);

    if (error) throw error;
  },

  async deleteTopic(topicId: string): Promise<void> {
    const { error } = await supabase
      .from('syllabus_items')
      .delete()
      .eq('id', topicId);

    if (error) throw error;
  }
};
