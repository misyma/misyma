import { type UserBook } from './userBook.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindUserBooksQueryParams {
  readonly bookshelfId?: string;
  readonly collectionId?: string;
  readonly isbn?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
