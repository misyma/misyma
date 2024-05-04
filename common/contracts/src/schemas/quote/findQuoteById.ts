import { type Quote } from './quote.js';

export interface FindQuoteByIdPathParams {
  readonly id: string;
  readonly userBookId: string;
}

export interface FindQuoteByIdResponseBody extends Quote {}
