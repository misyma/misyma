import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingsByBookIdPayload {
  bookId: string;
}

export interface FindBookReadingsByBookIdResult {
  bookReadings: BookReading[];
}

export type FindBookReadingsByBookIdQueryHandler = QueryHandler<
  FindBookReadingsByBookIdPayload,
  FindBookReadingsByBookIdResult
>;
