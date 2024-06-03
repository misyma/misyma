import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateGenreCommandHandler } from './updateGenreCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('UpdateGenreCommandHandler', () => {
  let commandHandler: UpdateGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateGenreCommandHandler>(symbols.updateGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre does not exist', async () => {
    const genreId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          id: genreId,
          name: Generator.words(2),
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Genre does not exist.',
        id: genreId,
      },
    });
  });

  it('throws an error - when Genre with given name already exists', async () => {
    const preExistingGenre = await genreTestUtils.createAndPersist();

    const secondGenre = await genreTestUtils.createAndPersist();

    await expect(
      async () =>
        await commandHandler.execute({
          id: preExistingGenre.id,
          name: secondGenre.name,
        }),
    ).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        resource: 'Genre',
        name: secondGenre.name,
      },
    });
  });
});
