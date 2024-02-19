import { type Book } from './book.js';

export interface UpdateBookGenresPathParams {
  bookId: string;
}

export interface UpdateBookGenresPayload {
  genreIds: string[];
}

export type UpdateBookGenresResult = Book;
