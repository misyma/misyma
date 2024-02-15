import { type Genre } from '../../entities/genre/genre.js';

export interface FindByIdPayload {
  readonly id: string;
}

export interface GenreRepository {
  findAll(): Promise<Genre[]>;
  findById(payload: FindByIdPayload): Promise<Genre | null>;
  create(name: string): Promise<Genre>;
  update(payload: Genre): Promise<Genre>;
  delete(payload: Genre): Promise<void>;
}
