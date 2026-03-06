import xss from "xss";

/**
 * Sanitize a single string value against XSS.
 */
export function sanitizeString(value: string): string {
  return xss(value.trim());
}

/**
 * Recursively sanitize all string values in an object.
 * Non-string values (numbers, booleans, null, undefined) are passed through.
 * Arrays are recursively sanitized.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = xss(value.trim());
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? xss(item.trim())
          : item && typeof item === "object"
            ? sanitizeObject(item)
            : item,
      );
    } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validate that a string is a valid UUID v4 format.
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Validate that a string is a valid URL (http/https only).
 */
export function isValidURL(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate that a string is a valid email address.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Clamp a numeric value within bounds.
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
