import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenreByIdPayload {
  readonly id: string;
}

export interface FindGenreByIdResult {
  readonly genre: Genre;
}

export type FindGenreByIdQueryHandler = QueryHandler<FindGenreByIdPayload, FindGenreByIdResult>;
