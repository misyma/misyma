import { ApiError } from '../../../modules/common/errors/apiError';

interface UserApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class UserApiError extends ApiError {
  public constructor(context: UserApiErrorContext) {
    super('UserApiError', context);
  }
}
