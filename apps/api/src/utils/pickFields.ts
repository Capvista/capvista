/**
 * Picks only the allowed fields from an object.
 * Logs a warning if disallowed fields are detected (potential mass assignment attack).
 */
export function pickFields<T extends Record<string, any>>(
  obj: T,
  allowedFields: string[],
  context?: string,
): Partial<T> {
  const picked: any = {};
  const disallowed: string[] = [];

  for (const key of Object.keys(obj)) {
    if (allowedFields.includes(key)) {
      if (obj[key] !== undefined) {
        picked[key] = obj[key];
      }
    } else {
      disallowed.push(key);
    }
  }

  if (disallowed.length > 0) {
    console.warn(
      `[SECURITY] Disallowed fields stripped${context ? ` on ${context}` : ""}: ${disallowed.join(", ")}`,
    );
  }

  return picked;
}
