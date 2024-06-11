import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type DeleteGenreCommandHandler } from './deleteGenreCommandHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('DeleteGenreCommandHandler', () => {
  let commandHandler: DeleteGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteGenreCommandHandler>(symbols.deleteGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();
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
        resource: 'Genre',
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
