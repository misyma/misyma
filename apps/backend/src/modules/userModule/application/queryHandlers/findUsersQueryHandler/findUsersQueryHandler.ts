import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface ExecutePayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface ExecuteResult {
  readonly users: User[];
  readonly total: number;
}

export type FindUsersQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
