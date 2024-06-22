import { type Bookshelf } from './bookshelf.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindBookshelvesQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindBookshelvesResponseBody {
  readonly data: Bookshelf[];
  readonly metadata: Metadata;
}
