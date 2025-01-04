import { type SortOrder } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';

export interface FindCollectionsQueryHandlerPayload {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortOrder | undefined;
}

export interface FindCollectionsQueryHandlerResult {
  readonly collections: Collection[];
  readonly total: number;
}

export type FindCollectionsQueryHandler = QueryHandler<
  FindCollectionsQueryHandlerPayload,
  FindCollectionsQueryHandlerResult
>;
