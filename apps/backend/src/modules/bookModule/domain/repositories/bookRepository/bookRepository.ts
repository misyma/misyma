import { type Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookPayload {
  readonly title: string;
  readonly releaseYear: number;
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
  updateBook(input: UpdateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book | null>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
