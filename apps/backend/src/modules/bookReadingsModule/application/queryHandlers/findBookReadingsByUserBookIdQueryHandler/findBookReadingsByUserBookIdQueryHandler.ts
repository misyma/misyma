import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingsByUserBookIdPayload {
  readonly userBookId: string;
}

export interface FindBookReadingsByUserBookIdResult {
  readonly bookReadings: BookReading[];
}

export type FindBookReadingsByUserBookIdQueryHandler = QueryHandler<
  FindBookReadingsByUserBookIdPayload,
  FindBookReadingsByUserBookIdResult
>;
