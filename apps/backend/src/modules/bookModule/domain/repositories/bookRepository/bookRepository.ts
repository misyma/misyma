import { type BookFormat, type BookStatus } from '@common/contracts';

import { type Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookPayload {
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: string;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly frontCoverImageUrl?: string;
  readonly backCoverImageUrl?: string;
  readonly status: BookStatus;
  readonly bookshelfId: string;
  readonly authors: Author[];
}

export interface FindBookPayload {
  readonly id?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface UpdateBookPayload {
  readonly book: Book;
}

export interface BookRepository {
  createBook(input: CreateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book | null>;
  // TODO: find books
  updateBook(input: UpdateBookPayload): Promise<Book>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
