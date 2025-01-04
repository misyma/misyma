import { type Author } from './author.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export interface FindAuthorsQueryParams {
  readonly name?: string;
  readonly ids?: string[];
  readonly userId?: string;
  readonly bookshelfId?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindAuthorsResponseBody {
  readonly data: Author[];
  readonly metadata: Metadata;
}
