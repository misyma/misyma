import { type UserBook } from './userBook.js';

export interface FindUserBookPathParams {
  readonly id: string;
}

export interface FindUserBookResponseBody extends UserBook {}
