import { ApiError } from '../../../common/errors/apiError.js';

interface AuthApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class AuthApiError extends ApiError {
  public constructor(context: AuthApiErrorContext) {
    super('AuthApiError', context);
  }
}
