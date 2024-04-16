import { type Book } from './book.js';

export interface FindBooksQueryParams {
  readonly isbn?: string;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
}
