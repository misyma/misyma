import { type UserBook } from './userBook.js';
import { type Metadata } from '../metadata.js';

export interface FindUserBooksByBookshelfIdPathParams {
  readonly bookshelfId: string;
}

export interface FindUserBooksByBookshelfIdQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUserBooksByBookshelfIdResponseBody {
  readonly data: UserBook[];
  readonly metadata: Metadata;
}
