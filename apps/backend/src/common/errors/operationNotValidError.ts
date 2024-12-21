import { BaseError, type BaseErrorContext } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly reason: string;
}

export class OperationNotValidError extends BaseError<Context> {
  public constructor(context: Context) {
    super('OperationNotValidError', 'Operation not valid.', context);
  }
}
