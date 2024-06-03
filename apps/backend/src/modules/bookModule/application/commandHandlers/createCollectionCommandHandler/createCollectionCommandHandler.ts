import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';

export interface CreateCollectionPayload {
  readonly name: string;
  readonly userId: string;
}

export interface CreateCollectionResult {
  readonly collection: Collection;
}

export type CreateCollectionCommandHandler = CommandHandler<CreateCollectionPayload, CreateCollectionResult>;
