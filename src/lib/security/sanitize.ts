/**
 * Strict Input Sanitization Engine
 * Protects against XSS, HTML Injection, Script Execution, and Malicious Payloads.
 */

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Sanitizes arbitrary text inputs by replacing dangerous HTML characters
 * with entity codes, removing null bytes and control characters.
 */
export const sanitizeString = (input: string | undefined | null, maxLength = 250): string => {
  if (!input || typeof input !== 'string') return '';

  // Remove NULL bytes & control characters
  const cleanChars = input.replace(/[\0\x00-\x1F\x7F-\x9F]/g, '');

  // HTML entity escape
  const escaped = cleanChars.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);

  // Trim whitespace & enforce max length constraint
  return escaped.trim().substring(0, maxLength);
};

/**
 * Sanitizes search query strings for pandal directory lookup.
 * Restricts query to safe alphanumeric, spaces, and hyphens.
 */
export const sanitizeSearchQuery = (query: string | undefined | null): string => {
  if (!query || typeof query !== 'string') return '';

  // Strip anything that is not alphanumeric, space, or hyphen
  const safeQuery = query.replace(/[^a-zA-Z0-9\s\-]/g, '');

  return safeQuery.trim().substring(0, 100);
};

/**
 * Validates numeric inputs (e.g. wait times, donation amounts) within min & max bounds.
 */
export const sanitizeNumber = (
  val: unknown,
  min: number,
  max: number,
  fallbackVal: number
): number => {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) return fallbackVal;
  return Math.max(min, Math.min(max, num));
};
