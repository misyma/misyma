import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface ExecutePayload {
  readonly ids?: string[] | undefined;
  readonly name?: string | undefined;
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface ExecuteResult {
  readonly authors: Author[];
  readonly total: number;
}

export type FindAuthorsQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
