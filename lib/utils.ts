/** Coerce a possibly-missing FormData string to a trimmed string. */
export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

export function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

/** Format a Date as a readable date, e.g. "24 Jun 2026". */
export function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}

/** Format a Date as a readable timestamp, e.g. "24 Jun 2026, 19:40". */
export function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/** Compute age in whole years from a date of birth. */
export function ageFromDob(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

/** Join name parts into a single display name, skipping empty middle names. */
export function fullName(p: { firstName: string; middleName?: string | null; lastName: string }) {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
}

/** Human label for the stored gender value. */
export function genderLabel(gender: string) {
  return gender === 'FEMALE' ? 'Female' : 'Male';
}
