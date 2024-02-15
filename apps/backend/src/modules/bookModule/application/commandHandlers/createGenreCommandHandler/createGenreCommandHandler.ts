import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface CreateGenrePayload {
  name: string;
}

export interface CreateGenreResult {
  genre: Genre;
}

export interface CreateGenreCommandHandler {
  createGenre(payload: CreateGenrePayload): Promise<CreateGenreResult>;
}
