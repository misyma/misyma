import { type Author } from './author.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export enum FindAuthorsSortField {
  createdAt = 'createdAt',
  name = 'name',
}

export interface FindAdminAuthorsQueryParams {
  readonly name?: string;
  readonly ids?: string[];
  readonly isApproved?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: FindAuthorsSortField;
  readonly sortOrder?: SortOrder;
}

export interface FindAdminAuthorsResponseBody {
  readonly data: Author[];
  readonly metadata: Metadata;
}
