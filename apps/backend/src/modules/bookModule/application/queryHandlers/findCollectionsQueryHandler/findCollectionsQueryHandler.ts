import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';

export interface FindCollectionsPayload {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindCollectionsResult {
  readonly collections: Collection[];
  readonly total: number;
}

export type FindCollectionsQueryHandler = QueryHandler<FindCollectionsPayload, FindCollectionsResult>;
