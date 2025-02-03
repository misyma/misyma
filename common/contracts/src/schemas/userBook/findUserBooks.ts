import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';
import { type Language } from '../book/language.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export enum FindUserBooksSortField {
  releaseYear = 'releaseYear',
  createdAt = 'createdAt',
}

export interface FindUserBooksQueryParams {
  readonly bookshelfId?: string;
  readonly collectionId?: string;
  readonly authorId?: string;
  readonly genreId?: string;
  readonly isbn?: string;
  readonly title?: string;
  readonly status?: ReadingStatus;
  readonly isFavorite?: boolean;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
  readonly language?: Language;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: FindUserBooksSortField;
  readonly sortOrder?: SortOrder;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
