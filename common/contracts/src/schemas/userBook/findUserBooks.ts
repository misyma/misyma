import { type UserBook } from './userBook.js';
import { type Metadata } from '../metadata.js';

export interface FindUserBooksQueryParams {
  readonly bookshelfId?: string;
  readonly collectionId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
