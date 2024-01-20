import { type Book } from './book.js';

export interface FindBookPathParams {
  readonly id: string;
}

export interface FindBookResponseBody extends Book {}
