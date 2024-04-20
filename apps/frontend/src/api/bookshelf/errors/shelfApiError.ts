import { ApiError } from '../../../common/errors/apiError';

interface ShelfApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class ShelfApiError extends ApiError {
  public constructor(context: ShelfApiErrorContext) {
    super('ShelfApiError', context);
  }
}
