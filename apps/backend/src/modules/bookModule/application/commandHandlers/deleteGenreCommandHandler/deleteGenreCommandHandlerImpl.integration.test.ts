import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

import { type DeleteGenreCommandHandler } from './deleteGenreCommandHandler.js';

describe('DeleteGenreCommandHandler', () => {
  let commandHandler: DeleteGenreCommandHandler;

  let databaseClient: DatabaseClient;

  let genreTestUtils: GenreTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<DeleteGenreCommandHandler>(symbols.deleteGenreCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Genre does not exist', async () => {
    const invalidUuid = Generator.uuid();

    try {
      await commandHandler.execute({
        id: invalidUuid,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Genre',
        id: invalidUuid,
      });

      return;
    }

    expect.fail();
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
