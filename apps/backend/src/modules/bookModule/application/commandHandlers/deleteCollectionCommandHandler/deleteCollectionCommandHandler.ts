import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteCollectionPayload {
  id: string;
}

export type DeleteCollectionCommandHandler = CommandHandler<DeleteCollectionPayload, void>;
