import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type Borrowing } from './borrowing.js';

export interface FindBorrowingsPathParams {
  readonly userBookId: string;
}

export interface FindBorrowingsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
  readonly isOpen?: boolean;
}

export interface FindBorrowingsResponseBody {
  readonly data: Borrowing[];
  readonly metadata: Metadata;
}
