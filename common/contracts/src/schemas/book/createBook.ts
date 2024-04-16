import { type Book } from './book.js';
import { type BookFormat } from './bookFormat.js';
import { type Language } from './language.js';

export interface CreateBookRequestBody {
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: Language;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly authorIds: string[];
}

export interface CreateBookResponseBody extends Book {}
