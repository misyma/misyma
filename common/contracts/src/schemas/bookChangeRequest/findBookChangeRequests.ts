import { type BookChangeRequest } from './bookChangeRequest.js';
import { type Metadata } from '../metadata.js';

export interface FindBookChangeRequestsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindBookChangeRequestsResponseBody {
  readonly data: BookChangeRequest[];
  readonly metadata: Metadata;
}
