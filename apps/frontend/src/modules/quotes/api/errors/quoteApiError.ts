import { ApiError } from '../../../common/errors/apiError';

interface QuoteApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
  statusCode: number;
}

export class QuoteApiError extends ApiError {
  public constructor(context: QuoteApiErrorContext) {
    super('QuoteApiError', context);
  }
}
