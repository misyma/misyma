import { type Genre } from './genre.js';

export interface FindGenreByNamePathParams {
  readonly name: string;
}

export type FindGenreByNameResponseBody = Genre;
