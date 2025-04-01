import { type Book } from './book.js';
import { type BookFormat } from './bookFormat.js';
import { type Language } from './language.js';

export interface CreateBookRequestBody {
  readonly title: string;
  readonly genreId: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly authorIds: string[];
}

export interface CreateBookResponseBody extends Book {}
