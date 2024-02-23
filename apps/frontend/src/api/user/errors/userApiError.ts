import { ApiError } from '../../../common/errors/apiError';

interface UserApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
}

export class UserApiError extends ApiError {
  public constructor(context: UserApiErrorContext) {
    super('UserApiError', context);
  }
}
