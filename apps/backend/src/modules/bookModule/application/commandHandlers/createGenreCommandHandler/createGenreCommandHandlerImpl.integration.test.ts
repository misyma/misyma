import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateGenreCommandHandler } from './createGenreCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('CreateGenreCommandHandlerImpl', () => {
  let commandHandler: CreateGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateGenreCommandHandler>(symbols.createGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre already exists', async () => {
    const genre = await genreTestUtils.createAndPersist();

    await expect(async () => await commandHandler.createGenre({ name: genre.name })).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Genre already exists.',
        name: genre.name,
      },
    });
  });

  it('creates Genre', async () => {
    const genreName = Generator.words(2);

    const { genre } = await commandHandler.createGenre({ name: genreName });

    expect(genre.getState()).toEqual({
      id: expect.any(String),
      name: genreName,
    });

    const persistedGenre = await genreTestUtils.findByName(genreName);

    expect(persistedGenre).not.toBeNull();

    expect(persistedGenre).toEqual(genre.getState());
  });
});
