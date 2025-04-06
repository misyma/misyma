import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type Author } from './author.js';

export interface FindAdminAuthorsQueryParams {
  readonly name?: string;
  readonly ids?: string[];
  readonly isApproved?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: 'createdAt' | 'name';
  readonly sortOrder?: SortOrder;
}

export interface FindAdminAuthorsResponseBody {
  readonly data: Author[];
  readonly metadata: Metadata;
}
