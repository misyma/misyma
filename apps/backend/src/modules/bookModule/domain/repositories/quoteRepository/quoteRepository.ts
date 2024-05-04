import { type Quote, type QuoteState } from '../../entities/quote/quote.js';

export interface FindQuotePayload {
  readonly id: string;
}

export interface FindQuotesPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface SavePayload {
  readonly quote: Quote | QuoteState;
}

export interface DeletePayload {
  readonly id: string;
}

export interface QuoteRepository {
  findQuote(payload: FindQuotePayload): Promise<Quote | null>;
  findQuotes(payload: FindQuotesPayload): Promise<Quote[]>;
  countQuotes(payload: FindQuotesPayload): Promise<number>;
  saveQuote(payload: SavePayload): Promise<Quote>;
  deleteQuote(payload: DeletePayload): Promise<void>;
}
