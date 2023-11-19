import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookPayload {
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string;
}

export interface FindBookPayload {
  readonly id?: string;
  readonly title?: string;
  readonly authorId?: string;
}

export interface DeleteBookPayload {
  readonly id: string;
}

export interface BookRepository {
  createBook(input: CreateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book | null>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
