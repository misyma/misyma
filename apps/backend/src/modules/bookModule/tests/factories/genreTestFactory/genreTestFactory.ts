import { Generator } from '../../../../../../tests/generator.js';
import { type GenreRawEntity } from '../../../../databaseModule/infrastructure/tables/genreTable/genreRawEntity.js';
import { Genre, type GenreState } from '../../../domain/entities/genre/genre.js';

export class GenreTestFactory {
  public createRaw(overrides: Partial<GenreRawEntity> = {}): GenreRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.genre().toLowerCase() + Generator.numericString(3),
      ...overrides,
    };
  }

  public create(overrides: Partial<GenreState> = {}): Genre {
    return new Genre({
      id: Generator.uuid(),
      name: Generator.genre().toLowerCase() + Generator.numericString(3),
      ...overrides,
    });
  }
}
