import { construct, crush, diff, isObject } from 'radash';

export type AnyValidObject = Record<string | number | symbol, unknown>;

export const getDiffBetweenObjects = (obj1: AnyValidObject, obj2: AnyValidObject) => {
  if (!isObject(obj1) || !isObject(obj2)) {
    throw new Error('Invalid objects provided.');
  }

  const crushedObject1 = crush(obj1);
  const crushedObject2 = crush(obj2);

  const entriesObject1 = Object.entries(crushedObject1);
  const entriesObject2 = Object.entries(crushedObject2);

  const difference = diff(entriesObject1, entriesObject2).reduce((acc, [key, val]) => {
    acc[key] = val;
    return acc;
  }, {} as AnyValidObject);

  return construct(difference) as AnyValidObject;
};
