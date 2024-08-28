import { type Book } from './book.js';
import { type Language } from './language.js';
import { type Metadata } from '../metadata.js';

export interface FindAdminBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly authorIds?: string[];
  readonly language?: Language;
  readonly isApproved?: boolean;
  readonly releaseYearBefore?: number;
  readonly releaseYearAfter?: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindAdminBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
