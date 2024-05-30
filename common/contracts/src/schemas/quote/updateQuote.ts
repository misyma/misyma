import { type Quote } from './quote.js';

export interface UpdateQuoteRequestBody {
  readonly content?: string;
  readonly isFavorite?: boolean;
  readonly page?: number;
}

export interface UpdateQuotePathParams {
  readonly quoteId: string;
  readonly userBookId: string;
}

export interface UpdateQuoteResponseBody extends Quote {}
