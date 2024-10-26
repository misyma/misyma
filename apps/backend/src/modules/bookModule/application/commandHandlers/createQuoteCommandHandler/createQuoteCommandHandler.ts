import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface CreateQuotePayload {
  readonly userId: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
  readonly page?: string | undefined;
}

export interface CreateQuoteResult {
  readonly quote: Quote;
}

export type CreateQuoteCommandHandler = CommandHandler<CreateQuotePayload, CreateQuoteResult>;
