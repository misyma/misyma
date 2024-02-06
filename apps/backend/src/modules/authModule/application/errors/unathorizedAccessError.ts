import { ApplicationError } from '../../../../common/errors/base/applicationError.js';

interface Context {
  readonly reason?: string;
  readonly [key: string]: unknown;
}

export class UnauthorizedAccessError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('UnauthorizedAccessError', 'Not authorized to perform this action.', context);
  }
}
