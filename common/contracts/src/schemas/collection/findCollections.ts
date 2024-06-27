import { type Collection } from './collection.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindCollectionsQueryParams {
  readonly userId: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindCollectionsResponseBody {
  readonly data: Collection[];
  readonly metadata: Metadata;
}
