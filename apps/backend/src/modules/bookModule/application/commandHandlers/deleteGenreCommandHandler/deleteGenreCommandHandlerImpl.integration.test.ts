import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type DeleteGenreCommandHandler } from './deleteGenreCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('DeleteGenreCommandHandler', () => {
  let commandHandler: DeleteGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteGenreCommandHandler>(symbols.deleteGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre does not exist', async () => {
    const invalidUuid = Generator.uuid();

    await expect(async () => {
      await commandHandler.execute({
        id: invalidUuid,
      });
    }).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Genre',
        id: invalidUuid,
      },
    });
  });

  it('deletes the Genre', async () => {
    const genre = await genreTestUtils.createAndPersist();

    await commandHandler.execute({
      id: genre.id,
    });

    const foundGenre = await genreTestUtils.findById(genre.id);

    expect(foundGenre).toBeNull();
  });
});
