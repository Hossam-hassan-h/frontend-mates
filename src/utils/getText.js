/**
 * Utility to safely get displayable English text.
 * - If value is a string, returns it unchanged (keeps old string data working).
 * - If value is an object { en, ar }, returns value.en (or value.ar if en is missing).
 * - If value is null or undefined, returns an empty string.
 *
 * @param {string | { en?: string, ar?: string } | null | undefined} value
 * @returns {string}
 */
export function getText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    if (typeof value.en === 'string') {
      return value.en;
    }
    if (typeof value.ar === 'string') {
      return value.ar;
    }
  }
  return String(value ?? '');
}

export default getText;
