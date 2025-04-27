export interface BorrowingRawEntity {
  readonly id: string;
  readonly userBookId: string;
  readonly borrower: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}
