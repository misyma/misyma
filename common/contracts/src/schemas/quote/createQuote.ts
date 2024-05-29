import { type Quote } from './quote.js';

export interface CreateQuotePathParams {
  readonly userBookId: string;
}

export interface CreateQuoteRequestBody {
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: string;
  readonly page?: number;
}

export interface CreateQuoteResponseBody extends Quote {}
