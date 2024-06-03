import { type CollectionState, type Collection } from '../../entities/collection/collection.js';

export type FindCollectionPayload =
  | {
      readonly id: string;
    }
  | {
      readonly name: string;
      readonly userId: string;
    };

export interface SaveCollectionPayload {
  readonly collection: CollectionState | Collection;
}

export interface FindCollections {
  readonly ids?: string[];
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteCollectionPayload {
  readonly id: string;
}

export interface CollectionRepository {
  findCollection(payload: FindCollectionPayload): Promise<Collection | null>;
  findCollections(payload: FindCollections): Promise<Collection[]>;
  countCollections(payload: FindCollections): Promise<number>;
  saveCollection(payload: SaveCollectionPayload): Promise<Collection>;
  deleteCollection(payload: DeleteCollectionPayload): Promise<void>;
}
