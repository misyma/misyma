import { type Borrowing, type BorrowingState } from '../../entities/borrowing/borrowing.js';

export interface FindBorrowingPayload {
  readonly id: string;
}

export interface FindBorrowingsPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: 'asc' | 'desc';
  readonly isOpen?: boolean;
}

export interface SavePayload {
  readonly borrowing: Borrowing | BorrowingState;
}

export interface DeletePayload {
  readonly id: string;
}

export interface BorrowingRepository {
  findBorrowing(payload: FindBorrowingPayload): Promise<Borrowing | null>;
  findBorrowings(payload: FindBorrowingsPayload): Promise<Borrowing[]>;
  countBorrowings(payload: FindBorrowingsPayload): Promise<number>;
  saveBorrowing(payload: SavePayload): Promise<Borrowing>;
  deleteBorrowing(payload: DeletePayload): Promise<void>;
}
