import { ApiError } from '../../../modules/common/errors/apiError';

interface UserApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class AuthorApiError extends ApiError {
  public constructor(context: UserApiErrorContext) {
    super('AuthorApiError', context);
  }
}
