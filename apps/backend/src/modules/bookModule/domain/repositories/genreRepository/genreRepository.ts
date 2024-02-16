import { type Genre } from '../../entities/genre/genre.js';

export interface FindByIdPayload {
  readonly id: string;
}

export interface CreatePayload {
  readonly name: string;
}

export interface FindByNamePayload {
  readonly name: string;
}

export interface GenreRepository {
  findAll(): Promise<Genre[]>;
  findById(payload: FindByIdPayload): Promise<Genre | null>;
  findByName(payload: FindByNamePayload): Promise<Genre | null>;
  create(payload: CreatePayload): Promise<Genre>;
  update(payload: Genre): Promise<Genre>;
  delete(payload: Genre): Promise<void>;
}
