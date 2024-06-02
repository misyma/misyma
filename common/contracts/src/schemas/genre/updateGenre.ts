import { type Genre } from './genre.js';

export interface UpdateGenrePathParams {
  readonly genreId: string;
}

export interface UpdateGenreRequestBody {
  readonly name: string;
}

export type UpdateGenreResponseBody = Genre;
