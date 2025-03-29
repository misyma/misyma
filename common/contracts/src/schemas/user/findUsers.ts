import { type Metadata } from '../metadata.js';

import { type User } from './user.js';

export interface FindUsersQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUsersResponseBody {
  readonly data: User[];
  readonly metadata: Metadata;
}
