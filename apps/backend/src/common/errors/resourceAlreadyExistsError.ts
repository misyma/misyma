import { BaseError, type BaseErrorContext } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly resource: string;
}

export class ResourceAlreadyExistsError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ResourceAlreadyExistsError', 'Resource already exists.', context);
  }
}
