export interface BookReadingRawEntity {
  readonly id: string;
  readonly userBookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}
