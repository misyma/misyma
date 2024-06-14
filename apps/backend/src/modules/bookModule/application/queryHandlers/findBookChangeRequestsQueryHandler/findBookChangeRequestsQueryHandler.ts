import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface FindBookChangeRequestsQueryHandlerPayload {
  readonly userId?: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindBookChangeRequestsQueryHandlerResult {
  readonly bookChangeRequests: BookChangeRequest[];
  readonly total: number;
}

export type FindBookChangeRequestsQueryHandler = QueryHandler<
  FindBookChangeRequestsQueryHandlerPayload,
  FindBookChangeRequestsQueryHandlerResult
>;
