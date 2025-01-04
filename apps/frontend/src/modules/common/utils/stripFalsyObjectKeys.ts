export const stripFalsyObjectKeys = <T extends Record<string | number | symbol, unknown>>(obj: T): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries(obj).reduce((p: any, [key, val]) => {
    if (!val) {
      return p;
    }

    p[key] = val;

    return p;
  }, {} as T);
};
