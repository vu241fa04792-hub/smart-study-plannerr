
import { supabase } from '../lib/supabase';
import type { Note } from '../types';

const mapNote = (n: any): Note => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  content: n.content || '',
  subjectId: n.subject_id || '',
  category: n.category || 'General',
  tags: n.tags || [],
  isPinned: Boolean(n.is_pinned),
  isFavorite: Boolean(n.is_favorite),
  attachmentIds: n.attachment_ids || [],
  createdAt: n.created_at || new Date().toISOString(),
  updatedAt: n.updated_at || new Date().toISOString()
});

export const noteService = {
  async fetchNotes(params?: {
    category?: string;
    pinned?: boolean;
  }): Promise<Note[]> {
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.category && params.category !== 'General') {
      query = query.eq('category', params.category);
    }

    if (params?.pinned !== undefined) {
      query = query.eq('is_pinned', params.pinned);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapNote);
  },

  async createNote(note: Partial<Note>): Promise<Note> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: authData.user.id,
        title: note.title,
        content: note.content || '',
        subject_id: note.subjectId || null,
        category: note.category || 'General',
        tags: note.tags || [],
        is_pinned: Boolean(note.isPinned),
        is_favorite: Boolean(note.isFavorite),
        attachment_ids: note.attachmentIds || []
      })
      .select()
      .single();

    if (error) throw error;
    return mapNote(data);
  },

  async updateNote(
    id: string,
    updates: Partial<Note>
  ): Promise<void> {
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.subjectId !== undefined) {
      payload.subject_id = updates.subjectId || null;
    }
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.isPinned !== undefined) payload.is_pinned = updates.isPinned;
    if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;
    if (updates.attachmentIds !== undefined) {
      payload.attachment_ids = updates.attachmentIds;
    }

    const { error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
