import { type Collection } from './collection.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export interface FindCollectionsQueryParams {
  readonly userId: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindCollectionsResponseBody {
  readonly data: Collection[];
  readonly metadata: Metadata;
}
