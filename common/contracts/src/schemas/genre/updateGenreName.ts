import { type Genre } from './genre.js';

export interface UpdateGenreNamePathParams {
  id: string;
}

export interface UpdateGenreNameBody {
  name: string;
}

export interface UpdateGenreNameResponse {
  genre: Genre;
}
