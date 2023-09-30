/* eslint-disable @typescript-eslint/no-explicit-any */

import validator from 'validator';

export class Validator {
  public static isInteger(value: unknown): value is number {
    if (!Validator.isNumber(value)) {
      return false;
    }

    return Number.isInteger(value);
  }

  public static isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  public static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  public static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  public static isNonEmptyString(value: unknown): boolean {
    if (!Validator.isString(value)) {
      return false;
    }

    return value.length >= 1;
  }

  public static isUuid(value: unknown): value is string {
    if (!Validator.isString(value)) {
      return false;
    }

    return validator.default.isUUID(value);
  }

  public static isEmail(value: unknown): value is string {
    if (!Validator.isString(value)) {
      return false;
    }

    return validator.default.isEmail(value);
  }

  public static isStringUrl(value: unknown): boolean {
    if (!Validator.isString(value)) {
      return false;
    }

    return validator.default.isURL(value);
  }

  public static isEnum<T extends Record<string, string>>(enumObject: T, value: any): value is T[keyof T] {
    return Object.values(enumObject).includes(value);
  }
}
