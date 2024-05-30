import { type UserBook } from './userBook.js';

export interface FindUserBookPathParams {
  readonly userBookId: string;
}

export interface FindUserBookResponseBody extends UserBook {}
