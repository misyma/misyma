import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type Book } from './book.js';

export enum FindBooksSortField {
  releaseYear = 'releaseYear',
  createdAt = 'createdAt',
}

export interface FindBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: FindBooksSortField;
  readonly sortOrder?: SortOrder;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
