import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenresPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindGenresResult {
  readonly genres: Genre[];
  readonly total: number;
}

export type FindGenresQueryHandler = QueryHandler<FindGenresPayload, FindGenresResult>;
