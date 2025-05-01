import { type Book } from './book.js';
import { type BookFormat } from './bookFormat.js';
import { type Language } from './language.js';

export interface UpdateBookPathParams {
  readonly bookId: string;
}

export interface UpdateBookRequestBody {
  readonly isbn?: string;
  readonly title?: string;
  readonly categoryId?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language?: Language;
  readonly translator?: string;
  readonly format?: BookFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly isApproved?: boolean;
  readonly authorIds?: string[];
}

export interface UpdateBookResponseBody extends Book {}
