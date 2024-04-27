import { type BookReadingState, type BookReading } from '../../entities/bookReading/bookReading.js';

export interface FindBookReadingPayload {
  readonly id: string;
}

export interface FindBookReadingsPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface SavePayload {
  readonly bookReading: BookReading | BookReadingState;
}

export interface DeletePayload {
  readonly id: string;
}

export interface BookReadingRepository {
  findBookReading(payload: FindBookReadingPayload): Promise<BookReading | null>;
  findBookReadings(payload: FindBookReadingsPayload): Promise<BookReading[]>;
  countBookReadings(payload: FindBookReadingsPayload): Promise<number>;
  saveBookReading(payload: SavePayload): Promise<BookReading>;
  deleteBookReading(payload: DeletePayload): Promise<void>;
}
