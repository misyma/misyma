import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingByIdPayload {
  id: string;
}

export interface FindBookReadingByIdResult {
  bookReading: BookReading;
}

export type FindBookReadingByIdQueryHandler = QueryHandler<FindBookReadingByIdPayload, FindBookReadingByIdResult>;
