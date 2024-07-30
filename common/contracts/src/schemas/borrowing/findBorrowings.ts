import { type Borrowing } from './borrowing.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindBorrowingsPathParams {
  readonly userBookId: string;
}

export interface FindBorrowingsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
  readonly isOpen?: boolean;
}

export interface FindBorrowingsResponseBody {
  readonly data: Borrowing[];
  readonly metadata: Metadata;
}
