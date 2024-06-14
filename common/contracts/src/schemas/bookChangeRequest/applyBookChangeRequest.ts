import { type BookChangeRequest } from './bookChangeRequest.js';
import { type BookChangeRequestFormat } from './bookChangeRequestFormat.js';
import { type Language } from './language.js';

export interface UpdateBookChangeRequestPathParams {
  readonly bookChangeRequestId: string;
}

export interface UpdateBookChangeRequestRequestBody {
  readonly title?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language?: Language;
  readonly translator?: string;
  readonly format?: BookChangeRequestFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly authorIds?: string[];
}

export interface UpdateBookChangeRequestResponseBody extends BookChangeRequest {}
