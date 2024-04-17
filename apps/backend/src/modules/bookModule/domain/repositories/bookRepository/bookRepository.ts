import { type BookState, type Book } from '../../../domain/entities/book/book.js';

export interface SaveBookPayload {
  readonly book: Book | BookState;
}

export interface FindBookPayload {
  readonly id?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface FindBooksPayload {
  readonly isbn?: string;
  readonly isApproved?: boolean;
  readonly title?: string;
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface BookRepository {
  saveBook(payload: SaveBookPayload): Promise<Book>;
  findBook(payload: FindBookPayload): Promise<Book | null>;
  // add pagination etc
  findBooks(payload: FindBooksPayload): Promise<Book[]>;
  deleteBook(payload: DeleteBookPayload): Promise<void>;
}
