import { Generator } from '@common/tests';

import { Genre, type GenreState } from '../../../domain/entities/genre/genre.js';
import { type GenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';

export class GenreTestFactory {
  private constructor() {}

  public static createFactory(): GenreTestFactory {
    return new GenreTestFactory();
  }

  public createRaw(overrides: Partial<GenreRawEntity> = {}): GenreRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.word(),
      ...overrides,
    };
  }

  public createEntity(overrides: Partial<GenreState> = {}): Genre {
    return new Genre({
      id: Generator.uuid(),
      name: Generator.word(),
      ...overrides,
    });
  }
}
