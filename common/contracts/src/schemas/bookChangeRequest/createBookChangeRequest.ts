import { type BookChangeRequest } from './bookChangeRequest.js';
import { type BookFormat } from '../book/bookFormat.js';
import { type Language } from '../book/language.js';

export interface CreateBookChangeRequestRequestBody {
  readonly bookId: string;
  readonly title?: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language?: Language;
  readonly translator?: string;
  readonly format?: BookFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly authorIds?: string[];
}

export interface CreateBookChangeRequestResponseBody extends BookChangeRequest {}
