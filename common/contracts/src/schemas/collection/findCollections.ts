import { type Collection } from './collection.js';
import { type Metadata } from '../metadata.js';

export interface FindCollectionsQueryParams {
  readonly userId: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindCollectionsResponseBody {
  readonly data: Collection[];
  readonly metadata: Metadata;
}
