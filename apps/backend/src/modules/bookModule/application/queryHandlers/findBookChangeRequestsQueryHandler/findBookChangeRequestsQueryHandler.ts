import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface FindBookChangeRequestsQueryHandlerPayload {
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly isApproved?: boolean | undefined;
}

export interface FindBookChangeRequestsQueryHandlerResult {
  readonly bookChangeRequests: BookChangeRequest[];
  readonly total: number;
}

export type FindBookChangeRequestsQueryHandler = QueryHandler<FindBookChangeRequestsQueryHandlerPayload, FindBookChangeRequestsQueryHandlerResult>;
