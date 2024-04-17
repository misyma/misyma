import { type Book } from './book.js';

export interface FindBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
}
