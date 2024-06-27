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

export interface FindCollectionsPayload {
  readonly ids?: string[];
  readonly userId?: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: 'asc' | 'desc';
}

export interface CountCollectionsPayload {
  readonly ids?: string[];
  readonly userId?: string;
}

export interface DeleteCollectionPayload {
  readonly id: string;
}

export interface CollectionRepository {
  findCollection(payload: FindCollectionPayload): Promise<Collection | null>;
  findCollections(payload: FindCollectionsPayload): Promise<Collection[]>;
  countCollections(payload: CountCollectionsPayload): Promise<number>;
  saveCollection(payload: SaveCollectionPayload): Promise<Collection>;
  deleteCollection(payload: DeleteCollectionPayload): Promise<void>;
}
