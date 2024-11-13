import { type BookChangeRequest } from './bookChangeRequest.js';
import { type BookFormat } from '../book/bookFormat.js';
import { type Language } from '../book/language.js';

export interface CreateBookChangeRequestRequestBody {
  readonly bookId: string;
  readonly title?: string;
  readonly isbn?: string | null;
  readonly publisher?: string | null;
  readonly releaseYear?: number | null;
  readonly language?: Language;
  readonly translator?: string | null;
  readonly format?: BookFormat;
  readonly pages?: number | null;
  readonly imageUrl?: string | null;
  readonly authorIds?: string[];
}

export interface CreateBookChangeRequestResponseBody extends BookChangeRequest {}
