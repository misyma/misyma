import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingsByUserBookIdPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface FindBookReadingsByUserBookIdResult {
  readonly bookReadings: BookReading[];
  readonly total: number;
}

export type FindBookReadingsByUserBookIdQueryHandler = QueryHandler<
  FindBookReadingsByUserBookIdPayload,
  FindBookReadingsByUserBookIdResult
>;
