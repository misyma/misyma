import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindGenreByNameQueryHandler } from './findGenreByNameQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('FindGenreByNameQueryHandlerImpl', () => {
  let queryHandler: FindGenreByNameQueryHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindGenreByNameQueryHandler>(symbols.findGenreByNameQueryHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre does not exist', async () => {
    const invalidName = 'invalidName';

    await expect(
      async () =>
        await queryHandler.execute({
          name: invalidName,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Genre',
        genreName: invalidName,
      },
    });
  });

  it('returns Genre - when Genre exists', async () => {
    const genre = await genreTestUtils.createAndPersist();

    const result = await queryHandler.execute({
      name: genre.name,
    });

    expect(result.genre.getId()).toEqual(genre.id);
  });
});
