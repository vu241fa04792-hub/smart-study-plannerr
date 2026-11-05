/**
 * Robust Native IndexedDB Storage for Persistent Educational Files and Profile Images
 * Account-isolated via userId
 */

export interface StoredFileRecord {
  id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  noteId?: string;
  blob: Blob;
  isDeleted?: boolean;
  deletedAt?: string;
}

const DB_NAME = 'SmartStudyPlannerDB';
const DB_VERSION = 1;
const FILES_STORE = 'educational_files';
const AVATARS_STORE = 'user_avatars';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const fileStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        fileStore.createIndex('userId', 'userId', { unique: false });
        fileStore.createIndex('noteId', 'noteId', { unique: false });
      }

      if (!db.objectStoreNames.contains(AVATARS_STORE)) {
        db.createObjectStore(AVATARS_STORE, { keyPath: 'userId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFileToIndexedDB(record: StoredFileRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getFileFromIndexedDB(id: string): Promise<StoredFileRecord | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const store = tx.objectStore(FILES_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getUserFilesFromIndexedDB(userId: string): Promise<StoredFileRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const store = tx.objectStore(FILES_STORE);
    const index = store.index('userId');
    const request = index.getAll(IDBKeyRange.only(userId));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Profile photo avatar storage
export async function saveProfilePhotoToIndexedDB(userId: string, blob: Blob): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AVATARS_STORE, 'readwrite');
    const store = tx.objectStore(AVATARS_STORE);
    const request = store.put({ userId, blob, updatedAt: new Date().toISOString() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getProfilePhotoFromIndexedDB(userId: string): Promise<Blob | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AVATARS_STORE, 'readonly');
    const store = tx.objectStore(AVATARS_STORE);
    const request = store.get(userId);

    request.onsuccess = () => resolve(request.result ? request.result.blob : undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProfilePhotoFromIndexedDB(userId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AVATARS_STORE, 'readwrite');
    const store = tx.objectStore(AVATARS_STORE);
    const request = store.delete(userId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
