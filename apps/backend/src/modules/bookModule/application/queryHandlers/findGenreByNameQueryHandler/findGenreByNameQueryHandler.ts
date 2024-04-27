import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface FindGenreByNamePayload {
  readonly name: string;
}

export interface FindGenreByNameResult {
  readonly genre: Genre;
}

export type FindGenreByNameQueryHandler = QueryHandler<FindGenreByNamePayload, FindGenreByNameResult>;
