import { type Genre } from './genre.js';

export interface CreateGenreBody {
  name: string;
}

export interface CreateGenreResponse {
  genre: Genre;
}
