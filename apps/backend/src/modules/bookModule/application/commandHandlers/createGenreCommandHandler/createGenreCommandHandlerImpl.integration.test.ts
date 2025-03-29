import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

import { type CreateGenreCommandHandler } from './createGenreCommandHandler.js';

describe('CreateGenreCommandHandlerImpl', () => {
  let commandHandler: CreateGenreCommandHandler;

  let databaseClient: DatabaseClient;

  let genreTestUtils: GenreTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<CreateGenreCommandHandler>(symbols.createGenreCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Genre already exists', async () => {
    const genre = await genreTestUtils.createAndPersist();

    try {
      await commandHandler.execute({ name: genre.name });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Genre',
        name: genre.name,
      });

      return;
    }

    expect.fail();
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
