import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingByIdPayload {
  readonly id: string;
}

export interface FindBookReadingByIdResult {
  readonly bookReading: BookReading;
}

export type FindBookReadingByIdQueryHandler = QueryHandler<FindBookReadingByIdPayload, FindBookReadingByIdResult>;
