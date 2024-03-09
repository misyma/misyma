import { Generator } from '@common/tests';

import { Genre, type GenreState } from '../../../domain/entities/genre/genre.js';
import { type GenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';

export class GenreTestFactory {
  public createRaw(overrides: Partial<GenreRawEntity> = {}): GenreRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.word(),
      ...overrides,
    };
  }

  public create(overrides: Partial<GenreState> = {}): Genre {
    return new Genre({
      id: Generator.uuid(),
      name: Generator.word(),
      ...overrides,
    });
  }
}
