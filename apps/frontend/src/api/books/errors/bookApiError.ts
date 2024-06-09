import { ApiError } from '../../../modules/common/errors/apiError';

interface BookApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class BookApiError extends ApiError {
  public constructor(context: BookApiErrorContext) {
    super('BookApiError', context);
  }
}
