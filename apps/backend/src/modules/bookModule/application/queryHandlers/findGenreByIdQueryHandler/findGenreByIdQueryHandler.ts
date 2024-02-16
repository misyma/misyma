import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenreByIdPayload {
  id: string;
}

export interface FindGenreByIdResult {
  genre: Genre;
}

export type FindGenreByIdQueryHandler = QueryHandler<FindGenreByIdPayload, FindGenreByIdResult>;
