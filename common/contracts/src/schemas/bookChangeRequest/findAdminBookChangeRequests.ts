import { type BookChangeRequest } from './bookChangeRequest.js';
import { type Metadata } from '../metadata.js';

export interface FindAdminBookChangeRequestsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindAdminBookChangeRequestsResponseBody {
  readonly data: BookChangeRequest[];
  readonly metadata: Metadata;
}
