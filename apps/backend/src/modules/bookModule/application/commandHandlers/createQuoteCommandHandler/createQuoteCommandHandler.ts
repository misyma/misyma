import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface CreateQuotePayload {
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
}

export interface CreateQuoteResult {
  readonly quote: Quote;
}

export type CreateQuoteCommandHandler = CommandHandler<CreateQuotePayload, CreateQuoteResult>;
