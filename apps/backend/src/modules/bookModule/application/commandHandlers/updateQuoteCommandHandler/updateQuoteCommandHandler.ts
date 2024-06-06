import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface UpdateQuotePayload {
  readonly id: string;
  readonly content?: string | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly page?: string | undefined;
}

export interface UpdateQuoteResult {
  readonly quote: Quote;
}

export type UpdateQuoteCommandHandler = CommandHandler<UpdateQuotePayload, UpdateQuoteResult>;
