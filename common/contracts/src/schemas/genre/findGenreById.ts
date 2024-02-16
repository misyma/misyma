import { type Genre } from './genre.js';

export interface FindGenreByIdPathParams {
  id: string;
}

export type FindGenreByIdResponse = Genre;
