import { type GenreState, type Genre } from '../../entities/genre/genre.js';

export interface FindGenrePayload {
  readonly id?: string;
  readonly name?: string;
}

export interface SaveGenrePayload {
  readonly genre: GenreState | Genre;
}

export interface FindGenres {
  readonly ids?: string[];
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteGenrePayload {
  readonly id: string;
}

export interface GenreRepository {
  findGenre(payload: FindGenrePayload): Promise<Genre | null>;
  findGenres(payload: FindGenres): Promise<Genre[]>;
  countGenres(payload: FindGenres): Promise<number>;
  saveGenre(payload: SaveGenrePayload): Promise<Genre>;
  deleteGenre(payload: DeleteGenrePayload): Promise<void>;
}
