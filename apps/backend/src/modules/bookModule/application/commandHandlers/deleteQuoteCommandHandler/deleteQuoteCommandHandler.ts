import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteQuotePayload {
  readonly userId: string;
  readonly quoteId: string;
}

export type DeleteQuoteCommandHandler = CommandHandler<DeleteQuotePayload, void>;
