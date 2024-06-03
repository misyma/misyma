import { type Collection } from './collection.js';

export interface CreateCollectionRequestBody {
  readonly name: string;
  readonly userId: string;
}

export type CreateCollectionResponseBody = Collection;
