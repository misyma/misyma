import { type Book } from './book.js';
import { type Metadata } from '../metadata.js';

export interface FindBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
