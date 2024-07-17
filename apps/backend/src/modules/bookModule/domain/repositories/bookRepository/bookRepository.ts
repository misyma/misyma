import { type BookState, type Book } from '../../../domain/entities/book/book.js';

export interface SaveBookPayload {
  readonly book: Book | BookState;
}

export interface ImportBookPayload {
  readonly book: BookState;
}

export interface FindBookPayload {
  readonly id: string;
}

export interface FindBooksPayload {
  readonly isbn?: string;
  readonly isApproved?: boolean;
  readonly title?: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface BookRepository {
  saveBook(payload: SaveBookPayload): Promise<Book>;
  importBook(payload: ImportBookPayload): Promise<void>;
  findBook(payload: FindBookPayload): Promise<Book | null>;
  findBooks(payload: FindBooksPayload): Promise<Book[]>;
  countBooks(payload: FindBooksPayload): Promise<number>;
  deleteBook(payload: DeleteBookPayload): Promise<void>;
}
