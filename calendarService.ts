
import { supabase } from '../lib/supabase';
import type { CalendarEvent } from '../types';

const mapEvent = (e: any): CalendarEvent => ({
  id: e.id,
  userId: e.user_id,
  title: e.title,
  description: e.description || '',
  category: e.event_type || 'other',
  date: e.date,
  time: e.start_time || '',
  endTime: e.end_time || '',
  room: e.location || '',
  weightage: e.weightage || '',
  subjectId: e.subject_id || ''
});

export const calendarService = {
  async fetchEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map(mapEvent);
  },

  async createEvent(
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: authData.user.id,
        title: event.title,
        description: event.description || '',
        event_type: event.category || 'other',
        date: event.date,
        start_time: event.time || null,
        end_time: event.endTime || null,
        location: event.room || '',
        weightage: event.weightage || '',
        subject_id: event.subjectId || null
      })
      .select()
      .single();

    if (error) throw error;
    return mapEvent(data);
  },

  async updateEvent(
    id: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.event_type = updates.category;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.time !== undefined) payload.start_time = updates.time || null;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime || null;
    if (updates.room !== undefined) payload.location = updates.room;
    if (updates.weightage !== undefined) payload.weightage = updates.weightage;
    if (updates.subjectId !== undefined) {
      payload.subject_id = updates.subjectId || null;
    }

    const { error } = await supabase
      .from('calendar_events')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
