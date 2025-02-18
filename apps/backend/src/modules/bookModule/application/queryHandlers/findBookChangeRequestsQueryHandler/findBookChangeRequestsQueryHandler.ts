import { type SortOrder } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface FindBookChangeRequestsQueryHandlerPayload {
  readonly userId?: string;
  readonly id?: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortOrder | undefined;
}

export interface FindBookChangeRequestsQueryHandlerResult {
  readonly bookChangeRequests: BookChangeRequest[];
  readonly total: number;
}

export type FindBookChangeRequestsQueryHandler = QueryHandler<
  FindBookChangeRequestsQueryHandlerPayload,
  FindBookChangeRequestsQueryHandlerResult
>;
