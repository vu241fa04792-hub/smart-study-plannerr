/**
 * Authentication and credential utilities for Smart Study Planner (Frontend-Only Demo)
 */

export async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_smart_study_salt_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple hash for older environments if SubtleCrypto isn't available
    let hash = 0;
    const str = password + '_smart_study_salt_v1';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return re.test(String(email).toLowerCase().trim());
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  requirements: {
    hasMinLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasLetter) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  let label: PasswordStrength['label'] = 'Too Weak';
  let color = 'bg-rose-500';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-rose-500';
  } else if (score === 2) {
    label = 'Medium';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Strong';
    color = 'bg-purple-600';
  } else if (score === 4) {
    label = 'Very Strong';
    color = 'bg-emerald-500';
  }

  return {
    score,
    label,
    color,
    requirements: {
      hasMinLength,
      hasLetter,
      hasNumber,
      hasSpecial
    }
  };
}
