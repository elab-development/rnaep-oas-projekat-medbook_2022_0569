import DOMPurify from 'dompurify';

export const sanitize = (value) => DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });

export const sanitizeObject = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? sanitize(v) : v])
  );
