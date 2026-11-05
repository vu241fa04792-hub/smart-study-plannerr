/**
 * UUID Utility helpers for Smart Study Planner
 * Ensures full compatibility between React client strings and PostgreSQL UUID columns.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIMPLE_HEX_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is a syntactically valid UUID for PostgreSQL.
 */
export const isValidUuid = (id?: string | null): boolean => {
  if (!id || typeof id !== 'string') return false;
  return SIMPLE_HEX_UUID_REGEX.test(id.trim());
};

/**
 * Generates a random RFC4122 v4 UUID string.
 */
export const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Deterministically maps any arbitrary string (e.g. legacy 'sub-dsa', 'top-1', 'task-123')
 * to a valid, collision-resistant PostgreSQL UUID.
 * If the input is already a valid UUID, returns it unchanged.
 */
export const toValidUuid = (input?: string | null): string => {
  if (!input || typeof input !== 'string') {
    return generateUuid();
  }
  const clean = input.trim();
  if (isValidUuid(clean)) {
    return clean.toLowerCase();
  }

  // FNV-1a based 128-bit deterministic hash representation
  let h1 = 0x811c9dc5;
  let h2 = 0x41c6ce57;
  let h3 = 0x9e3779b9;
  let h4 = 0x5bd1e995;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ ch, 2654435761) >>> 0;
    h3 = Math.imul(h3 ^ ch, 2246822519) >>> 0;
    h4 = Math.imul(h4 ^ ch, 3266489917) >>> 0;
  }

  const p1 = h1.toString(16).padStart(8, '0');
  const p2 = (h2 & 0xffff).toString(16).padStart(4, '0');
  const p3 = ('4' + ((h2 >>> 16) & 0x0fff).toString(16).padStart(3, '0')).slice(0, 4); // v4 marker
  const p4 = (((h3 & 0x3f) | 0x80).toString(16).padStart(2, '0') + ((h3 >>> 8) & 0xff).toString(16).padStart(2, '0')).slice(0, 4);
  const p5 = (h4.toString(16).padStart(8, '0') + (h3 >>> 16).toString(16).padStart(4, '0')).slice(0, 12);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
};
