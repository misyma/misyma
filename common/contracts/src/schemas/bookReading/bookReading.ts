export interface BookReading {
  readonly id: string;
  readonly bookId: string;
  readonly comment: string;
  readonly rating: number;
  readonly startedAt: Date;
  readonly endedAt?: Date;
}
