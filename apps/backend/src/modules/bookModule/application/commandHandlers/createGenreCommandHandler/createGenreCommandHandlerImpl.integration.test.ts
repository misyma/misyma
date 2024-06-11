import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type CreateGenreCommandHandler } from './createGenreCommandHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('CreateGenreCommandHandlerImpl', () => {
  let commandHandler: CreateGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateGenreCommandHandler>(symbols.createGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();
  });

  it('throws an error - when Genre already exists', async () => {
    const genre = await genreTestUtils.createAndPersist();

    await expect(async () => await commandHandler.execute({ name: genre.name })).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        resource: 'Genre',
        name: genre.name,
      },
    });
  });

  it('creates Genre', async () => {
    const genreName = Generator.words(2);

    const { genre } = await commandHandler.execute({ name: genreName });

    expect(genre.getName()).toEqual(genreName);

    const persistedGenre = await genreTestUtils.findByName(genreName);

    expect(persistedGenre).not.toBeNull();

    expect(persistedGenre?.id).toEqual(genre.getId());

    expect(persistedGenre?.name).toEqual(genre.getName());
  });
});
