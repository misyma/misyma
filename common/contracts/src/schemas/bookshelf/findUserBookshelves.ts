import { type Bookshelf } from './bookshelf.js';
import { type Metadata } from '../metadata.js';

export interface FindBookshelvesByUserIdParams {
  readonly userId: string;
}

export interface FindBookshelvesByUserIdQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindBookshelvesByUserIdResponseBody {
  readonly data: Bookshelf[];
  readonly metadata: Metadata;
}
