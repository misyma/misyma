import { type Quote } from './quote.js';

export interface CreateQuoteRequestBody {
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: string;
  readonly page?: string;
}

export interface CreateQuoteResponseBody extends Quote {}
