import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteQuotePayload {
  readonly id: string;
}

export type DeleteQuoteCommandHandler = CommandHandler<DeleteQuotePayload, void>;
