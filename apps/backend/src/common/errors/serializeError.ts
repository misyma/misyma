export function serializeError(error: unknown, seen = new WeakSet<object>()): Record<string, unknown> {
  if (error instanceof Error) {
    if (seen.has(error)) {
      return { message: 'Circular reference' };
    }
    seen.add(error);

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...Object.fromEntries(
        Object.getOwnPropertyNames(error).map((key) => [key, serializeValue(Reflect.get(error, key), seen)]),
      ),
    };
  }

  return { error: serializeValue(error, seen) };
}

function serializeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return serializeError(value, seen);
  } else if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return 'Circular reference';
    }
    seen.add(value);

    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, serializeValue(val, seen)]));
  }

  return value;
}
