export interface BookReadingRawEntity {
  readonly id: string;
  readonly user_book_id: string;
  readonly rating: number;
  readonly comment?: string | undefined;
  readonly started_at: Date;
  readonly ended_at: Date;
}
