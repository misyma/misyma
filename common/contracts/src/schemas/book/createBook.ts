import { type Book } from './book.js';
import { type BookFormat } from './bookFormat.js';

export interface CreateBookRequestBody {
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: string;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly authorIds: string[];
}

export interface CreateBookResponseBody extends Book {}
