import { type Genre } from './genre.js';

export interface CreateGenreBody {
  name: string;
}

export type CreateGenreResponse = Genre;
