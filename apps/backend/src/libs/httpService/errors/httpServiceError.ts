import { BaseError } from '../../../common/errors/baseError.js';

interface Context {
  readonly name?: string;
  readonly message: string;
}

export class HttpServiceError extends BaseError<Context> {
  public constructor(context: Context) {
    super('HttpServiceError', 'Http service error.', context);
  }
}
