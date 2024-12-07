import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export enum UserBookExpandField {
  collections = 'collections',
  genres = 'genres',
  readings = 'readings',
}

export interface FindUserBooksQueryParams {
  readonly userId?: string;
  readonly bookshelfId?: string;
  readonly collectionId?: string;
  readonly authorId?: string;
  readonly isbn?: string;
  readonly title?: string;
  readonly status?: ReadingStatus;
  readonly isFavorite?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
  // comma separated list of fields to expand, e.g. collections,genres,readings
  readonly expandFields?: string;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
