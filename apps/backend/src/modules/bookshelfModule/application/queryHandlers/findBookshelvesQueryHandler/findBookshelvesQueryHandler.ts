import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface FindBookshelvesQueryHandlerPayload {
  readonly userId: string;
  readonly name?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface FindBookshelvesQueryHandlerResult {
  readonly bookshelves: Bookshelf[];
  readonly total: number;
}

export type FindBookshelvesQueryHandler = QueryHandler<
  FindBookshelvesQueryHandlerPayload,
  FindBookshelvesQueryHandlerResult
>;
