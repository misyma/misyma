export interface BookReading {
  readonly id: string;
  readonly userBookId: string;
  readonly comment: string;
  readonly rating: number;
  readonly startedAt: string;
  readonly endedAt?: string;
}
