export interface BorrowingRawEntity {
  readonly id: string;
  readonly user_book_id: string;
  readonly borrower: string;
  readonly started_at: Date;
  readonly ended_at?: Date | undefined;
}
