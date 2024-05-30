import { type Book } from './book.js';

export interface FindBookPathParams {
  readonly bookId: string;
}

export interface FindBookResponseBody extends Book {}
