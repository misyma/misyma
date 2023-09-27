import { type SecurityMode } from '../../../common/types/http/securityMode.js';
import { ApplicationError } from '../../../common/validation/errors/base/applicationError.js';

interface Context {
  readonly securityMode: SecurityMode;
  readonly reason: string;
}

export class UnauthorizedAccessError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('UnauthorizedAccessError', 'Not authorized to perform this action.', context);
  }
}
