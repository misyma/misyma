import { type BookState, type Book } from '../../../domain/entities/book/book.js';

export interface SaveBookPayload {
  readonly book: Book | BookState;
}

export interface FindBookPayload {
  readonly id?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface BookRepository {
  saveBook(input: SaveBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book | null>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
