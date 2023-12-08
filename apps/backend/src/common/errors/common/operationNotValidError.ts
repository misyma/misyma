import { BaseError } from '../base/baseError.js';

interface Context {
  readonly reason: string;
  readonly value: unknown;
  readonly [key: string]: unknown;
}

export class OperationNotValidError extends BaseError<Context> {
  public constructor(context: Context) {
    super('OperationNotValidError', 'Operation not valid.', context);
  }
}
