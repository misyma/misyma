export function serializeError(error: unknown): Record<string, unknown> {
  const serializedError: Record<string, unknown> = {};

  if (error instanceof Error) {
    serializedError['message'] = error.message;

    for (const key of Object.getOwnPropertyNames(error)) {
      const value = Reflect.get(error, key);

      serializedError[key] = value instanceof Error ? serializeError(value) : serializeValue(value);
    }

    return serializedError;
  } else {
    return { error };
  }
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return serializeError(value);
  } else if (typeof value === 'object' && value !== null) {
    const serializedObject: Record<string, unknown> = {};

    for (const key of Object.keys(value)) {
      serializedObject[key] = serializeValue((value as Record<string, unknown>)[key]);
    }

    return serializedObject;
  } else {
    return value;
  }
}
