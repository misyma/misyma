import { type Book } from './book.js';
import { type Language } from './language.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';
import { type FindBooksSortField } from './findBooksSortField.js';

export interface FindAdminBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly authorIds?: string[];
  readonly language?: Language;
  readonly isApproved?: boolean;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: FindBooksSortField;
  readonly sortOrder?: SortOrder;
}

export interface FindAdminBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
