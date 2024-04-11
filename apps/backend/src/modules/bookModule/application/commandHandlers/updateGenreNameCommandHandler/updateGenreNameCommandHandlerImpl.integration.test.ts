import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type UpdateGenreNameCommandHandler } from './updateGenreNameCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('UpdateGenreNameCommandHandler', () => {
  let commandHandler: UpdateGenreNameCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateGenreNameCommandHandler>(symbols.updateGenreNameCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre does not exist', async () => {
    const invalidUuid = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          id: invalidUuid,
          name: Generator.words(2),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Genre',
        id: invalidUuid,
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
      instance: OperationNotValidError,
      context: {
        reason: 'Genre with this name already exists.',
        name: secondGenre.name,
      },
    });
  });
});
