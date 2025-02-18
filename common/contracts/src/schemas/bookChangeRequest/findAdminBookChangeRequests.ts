import { type BookChangeRequest } from './bookChangeRequest.js';
import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

export interface FindAdminBookChangeRequestsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindAdminBookChangeRequestsResponseBody {
  readonly data: BookChangeRequest[];
  readonly metadata: Metadata;
}
