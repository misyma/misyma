import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenresResult {
  genres: Genre[];
}

export type FindGenresQueryHandler = QueryHandler<void, FindGenresResult>;
