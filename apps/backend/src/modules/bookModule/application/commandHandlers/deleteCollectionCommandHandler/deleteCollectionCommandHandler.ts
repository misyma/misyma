import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteCollectionPayload {
  readonly id: string;
}

export type DeleteCollectionCommandHandler = CommandHandler<DeleteCollectionPayload, void>;
