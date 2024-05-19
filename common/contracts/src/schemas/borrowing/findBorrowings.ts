import { type Borrowing } from './borrowing.js';
import { type Metadata } from '../metadata.js';

export interface FindBorrowingsPathParams {
  readonly userBookId: string;
}

export interface FindBorrowingsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindBorrowingsResponseBody {
  readonly data: Borrowing[];
  readonly metadata: Metadata;
}
