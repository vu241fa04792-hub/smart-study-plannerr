
import { supabase } from '../lib/supabase';
import { fileService } from './fileService';
import { getUserFilesFromIndexedDB } from '../utils/indexedDB';

export interface MigrationReport {
  success: boolean;
  message?: string;
  report?: {
    subjects: number;
    syllabus_items: number;
    tasks: number;
    notes: number;
    calendar_events: number;
    focus_sessions: number;
    study_plans: number;
    files_uploaded?: number;
    errors?: string[];
  };
}

export const migrationService = {
  async migrateUserDataToSupabase(
    userId: string
  ): Promise<MigrationReport> {
    const prefix = `smart_study_${userId}_`;

    const getStored = (key: string, fallback: any = []) => {
      try {
        const raw = localStorage.getItem(`${prefix}${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      if (!authData.user || authData.user.id !== userId) {
        throw new Error('Please sign in with the correct account.');
      }

      const subjects = getStored('subjects', []);
      const tasks = getStored('tasks', []);
      const notes = getStored('notes', []);
      const calendarEvents = getStored('calendarEvents', []);
      const focusSessions = getStored('focusSessions', []);
      const studyPlans = getStored('studyPlans', []);

      let filesCount = 0;
      const errors: string[] = [];

      try {
        const localFiles = await getUserFilesFromIndexedDB(userId);

        for (const fileRec of localFiles) {
          if (!fileRec.blob) continue;

          const fileObj = new File(
            [fileRec.blob],
            fileRec.name,
            { type: fileRec.type }
          );

          try {
            await fileService.uploadFile(fileObj, {
              customTitle: fileRec.name,
              subjectId: (fileRec as any).subjectId
            });
            filesCount++;
          } catch (error: any) {
            errors.push(
              `File ${fileRec.name}: ${error.message || 'Upload failed'}`
            );
          }
        }
      } catch (error: any) {
        errors.push(
          `IndexedDB: ${error.message || 'File migration failed'}`
        );
      }

      return {
        success: errors.length === 0,
        message: 'Local data was read. Database record migration still needs to be connected.',
        report: {
          subjects: subjects.length,
          syllabus_items: subjects.reduce(
            (total: number, subject: any) =>
              total + (subject.topics?.length || 0),
            0
          ),
          tasks: tasks.length,
          notes: notes.length,
          calendar_events: calendarEvents.length,
          focus_sessions: focusSessions.length,
          study_plans: studyPlans.length,
          files_uploaded: filesCount,
          errors
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Data migration failed'
      };
    }
  }
};
