import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindGenreByIdQueryHandler } from './findGenreByIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('FindGenreByIdQueryHandlerImpl', () => {
  let queryHandler: FindGenreByIdQueryHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindGenreByIdQueryHandler>(symbols.findGenreByIdQueryHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Genre was not found', async () => {
    const invalidUuid = Generator.uuid();

    await expect(async () =>
      queryHandler.execute({
        id: invalidUuid,
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Genre',
        id: invalidUuid,
      },
    });
  });

  it('returns the Genre', async () => {
    const genre = await genreTestUtils.createAndPersist();

    const result = await queryHandler.execute({
      id: genre.id,
    });

    expect(result.genre.getId()).toEqual(genre.id);
  });
});
