export interface Borrowing {
  readonly id: string;
  readonly userBookId: string;
  readonly borrower: string;
  readonly startedAt: string;
  readonly endedAt?: string;
}
