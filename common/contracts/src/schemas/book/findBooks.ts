import { type Book } from './book.js';

export interface FindBooksResponseBody {
  readonly data: Book[];
}
