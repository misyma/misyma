import { type Book } from './book.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
