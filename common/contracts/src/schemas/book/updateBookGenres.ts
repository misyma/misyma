import { type Book } from './book.js';

export interface UpdateBookGenresPathParams {
  readonly bookId: string;
}

export interface UpdateBookGenresRequestBody {
  readonly genreIds: string[];
}

export type UpdateBookGenresResponseBody = Book;
