import { type Collection } from './collection.js';

export interface UpdateCollectionPathParams {
  readonly collectionId: string;
}

export interface UpdateCollectionRequestBody {
  readonly name: string;
}

export type UpdateCollectionResponseBody = Collection;
