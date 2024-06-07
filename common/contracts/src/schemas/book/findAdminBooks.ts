import { type Book } from './book.js';
import { type Metadata } from '../metadata.js';

export interface FindAdminBooksQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindAdminBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
