import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenreByNamePayload {
  name: string;
}

export interface FindGenreByNameResult {
  genre: Genre;
}

export type FindGenreByNameQueryHandler = QueryHandler<FindGenreByNamePayload, FindGenreByNameResult>;
