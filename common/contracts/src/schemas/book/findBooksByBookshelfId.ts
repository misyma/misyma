import { type Book } from './book.js';

export interface FindBooksByBookshelfIdPathParams {
  bookshelfId: string;
}

export interface FindBooksByBookshelfIdResponseBody {
  data: Book[];
}
