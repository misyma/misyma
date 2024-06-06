import { type User } from './user.js';
import { type Metadata } from '../metadata.js';

export interface FindUsersQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUsersResponseBody {
  readonly data: User[];
  readonly metadata: Metadata;
}
