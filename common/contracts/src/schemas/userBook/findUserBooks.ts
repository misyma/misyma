import { type Language } from '../book/language.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';

export interface FindUserBooksQueryParams {
  readonly bookshelfId?: string;
  readonly collectionId?: string;
  readonly authorId?: string;
  readonly categoryId?: string;
  readonly isbn?: string;
  readonly title?: string;
  readonly status?: ReadingStatus;
  readonly isFavorite?: boolean;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
  readonly language?: Language;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: 'releaseYear' | 'createdAt' | 'rating' | 'readingDate';
  readonly sortOrder?: SortOrder;
  readonly isRated?: boolean;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
