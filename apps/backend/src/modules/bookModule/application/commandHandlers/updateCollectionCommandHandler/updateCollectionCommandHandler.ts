import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';

export interface UpdateCollectionPayload {
  readonly id: string;
  readonly name: string;
}

export interface UpdateCollectionResult {
  readonly collection: Collection;
}

export type UpdateCollectionCommandHandler = CommandHandler<UpdateCollectionPayload, UpdateCollectionResult>;
