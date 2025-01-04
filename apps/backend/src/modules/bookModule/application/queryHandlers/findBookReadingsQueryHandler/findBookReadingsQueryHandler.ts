import { type SortOrder } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface FindBookReadingsQueryHandlerPayload {
  readonly userId: string;
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortOrder | undefined;
}

export interface FindBookReadingsQueryHandlerResult {
  readonly bookReadings: BookReading[];
  readonly total: number;
}

export type FindBookReadingsQueryHandler = QueryHandler<
  FindBookReadingsQueryHandlerPayload,
  FindBookReadingsQueryHandlerResult
>;
