import { type UserBook } from './userBook.js';

export interface FindUserBooksByBookshelfIdPathParams {
  readonly bookshelfId: string;
}

export interface FindUserBooksByBookshelfIdResponseBody {
  readonly data: UserBook[];
}
