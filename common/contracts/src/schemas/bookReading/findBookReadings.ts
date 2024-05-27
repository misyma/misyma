import { type BookReading } from './bookReading.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindBookReadingsPathParams {
  readonly userBookId: string;
}

export interface FindBookReadingsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindBookReadingsResponseBody {
  readonly data: BookReading[];
  readonly metadata: Metadata;
}
