import { type GenreState, type Genre } from '../../entities/genre/genre.js';

export interface FindGenrePayload {
  readonly id?: string;
  readonly name?: string;
}

export interface SaveGenrePayload {
  readonly genre: GenreState | Genre;
}

export interface FindGenresByIds {
  readonly ids: string[];
}

export interface DeleteGenrePayload {
  readonly id: string;
}

export interface GenreRepository {
  findGenre(payload: FindGenrePayload): Promise<Genre | null>;
  findGenresByIds(payload: FindGenresByIds): Promise<Genre[]>;
  findAllGenres(): Promise<Genre[]>;
  saveGenre(payload: SaveGenrePayload): Promise<Genre>;
  deleteGenre(payload: DeleteGenrePayload): Promise<void>;
}
