
import { supabase } from '../lib/supabase';
import type { EducationalFileMeta } from '../types';

const BUCKET = 'study-files';

const mapFile = (f: any): EducationalFileMeta => ({
  id: f.id,
  userId: f.user_id,
  name: f.file_name,
  customTitle: f.file_name,
  size: Number(f.file_size || 0),
  type: f.file_type || 'application/octet-stream',
  uploadDate: f.created_at
    ? f.created_at.split('T')[0]
    : new Date().toISOString().split('T')[0],
  subjectId: f.subject_id || '',
  isDeleted: false
});

export const fileService = {
  async fetchFiles(): Promise<EducationalFileMeta[]> {
    const { data, error } = await supabase
      .from('study_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapFile);
  },

  async uploadFile(
    file: File,
    options?: {
      subjectId?: string;
      taskId?: string;
      noteId?: string;
      customTitle?: string;
    }
  ): Promise<EducationalFileMeta> {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('Please sign in first.');
    }

    const userId = authData.user.id;
    const fileId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${fileId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('study_files')
      .insert({
        id: fileId,
        user_id: userId,
        subject_id: options?.subjectId || null,
        file_name: options?.customTitle || file.name,
        file_path: filePath,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size
      })
      .select()
      .single();

    if (error) {
      await supabase.storage.from(BUCKET).remove([filePath]);
      throw error;
    }

    return mapFile(data);
  },

  async downloadFile(id: string): Promise<Blob> {
    const { data: fileData, error: fetchError } = await supabase
      .from('study_files')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(fileData.file_path);

    if (error) throw error;
    return data;
  },

  async deleteFile(id: string): Promise<void> {
    const { data: fileData, error: fetchError } = await supabase
      .from('study_files')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([fileData.file_path]);

    if (storageError) throw storageError;

    const { error } = await supabase
      .from('study_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
