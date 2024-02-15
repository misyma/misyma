import { type Genre } from './genre.js';

export interface FindGenreByNameQueryParams {
  readonly name: string;
}

export interface FindGenreByNameResponse {
  genre: Genre;
}
