import { type BaseErrorContext, BaseError } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly service: string;
}

export class ExternalServiceError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ExternalServiceError', 'External service error.', context);
  }
}
