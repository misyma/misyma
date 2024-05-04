import { type Quote } from './quote.js';

export interface UpdateQuoteRequestBody {
  readonly content?: string;
  readonly isFavorite?: boolean;
}

export interface UpdateQuotePathParams {
  readonly id: string;
  readonly userBookId: string;
}

export interface UpdateQuoteResponseBody extends Quote {}
