import { type Language } from '@common/contracts';

import { type BookState, type Book } from '../../../domain/entities/book/book.js';

export interface SaveBookPayload {
  readonly book: Book | BookState;
}

export interface FindBookPayload {
  readonly id: string;
}

export interface FindBooksPayload {
  readonly isbn?: string;
  readonly isApproved?: boolean;
  readonly title?: string;
  readonly authorIds?: string[];
  readonly language?: Language;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: 'asc' | 'desc';
}

export interface CountBooksPayload {
  readonly isbn?: string;
  readonly isApproved?: boolean;
  readonly title?: string;
  readonly authorIds?: string[];
  readonly language?: Language;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface BookRepository {
  saveBook(payload: SaveBookPayload): Promise<Book>;
  findBook(payload: FindBookPayload): Promise<Book | null>;
  findBooks(payload: FindBooksPayload): Promise<Book[]>;
  countBooks(payload: CountBooksPayload): Promise<number>;
  deleteBook(payload: DeleteBookPayload): Promise<void>;
}
