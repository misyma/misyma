import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';

export interface CreateCollectionPayload {
  name: string;
}

export interface CreateCollectionResult {
  collection: Collection;
}

export type CreateCollectionCommandHandler = CommandHandler<CreateCollectionPayload, CreateCollectionResult>;
