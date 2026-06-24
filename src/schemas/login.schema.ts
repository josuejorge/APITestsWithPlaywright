export const loginSuccessSchema = {
  message: "string",
  authorization: "string",
};

export const loginFailSchema = {
  message: "string",
};

export function validateSchema(
  body: Record<string, unknown>,
  schema: Record<string, string>
): string[] {
  const errors: string[] = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in body)) {
      errors.push(`Missing field: "${key}"`);
      continue;
    }
    if (typeof body[key] !== expectedType) {
      errors.push(
        `Field "${key}": expected ${expectedType}, got ${typeof body[key]}`
      );
    }
  }

  return errors;
}
