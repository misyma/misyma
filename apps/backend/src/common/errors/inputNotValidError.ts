import { BaseError, type BaseErrorContext } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly reason: string;
  readonly value: unknown;
}

export class InputNotValidError extends BaseError<Context> {
  public constructor(context: Context) {
    super('InputNotValidError', 'Input not valid.', context);
  }
}
