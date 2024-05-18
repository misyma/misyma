import { type UserBook } from './userBook.js';
import { type Metadata } from '../metadata.js';

export interface FindUserBooksPathParams {
  readonly bookshelfId: string;
}

export interface FindUserBooksQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUserBooksResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
