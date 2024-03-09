import { beforeEach, expect, describe, it } from 'vitest';

import { GenreMapperImpl } from './genreMapperImpl.js';
import { GenreTestFactory } from '../../../../tests/factories/genreTestFactory/genreTestFactory.js';

describe('GenreMapperImpl', () => {
  let genreMapperImpl: GenreMapperImpl;

  const genreTestFactory = new GenreTestFactory();

  beforeEach(async () => {
    genreMapperImpl = new GenreMapperImpl();
  });

  it('maps from genre raw entity to domain genre', async () => {
    const genreEntity = genreTestFactory.createRaw();

    const genre = genreMapperImpl.mapToDomain(genreEntity);

    expect(genre).toEqual({
      id: genreEntity.id,
      state: {
        name: genreEntity.name,
      },
    });
  });

  it('maps from domain genre to genre raw entity', () => {
    const genre = genreTestFactory.create();

    const genreRawEntity = genreMapperImpl.mapToPersistence(genre);

    expect(genreRawEntity).toEqual({
      id: genre.getId(),
      name: genre.getName(),
    });
  });
});
