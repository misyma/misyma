import { type Bookshelf } from './bookshelf.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export interface FindBookshelvesQueryParams {
  readonly name?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindBookshelvesResponseBody {
  readonly data: Bookshelf[];
  readonly metadata: Metadata;
}
