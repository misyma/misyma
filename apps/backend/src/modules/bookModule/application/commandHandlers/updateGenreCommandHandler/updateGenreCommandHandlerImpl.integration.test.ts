import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateGenreCommandHandler } from './updateGenreCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('UpdateGenreCommandHandler', () => {
  let commandHandler: UpdateGenreCommandHandler;

  let genreTestUtils: GenreTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateGenreCommandHandler>(symbols.updateGenreCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();
  });

  it('throws an error - when Genre does not exist', async () => {
    const genreId = Generator.uuid();

    try {
      await commandHandler.execute({
        id: genreId,
        name: Generator.words(2),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Genre does not exist.',
        id: genreId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Genre with given name already exists', async () => {
    const preExistingGenre = await genreTestUtils.createAndPersist();

    const secondGenre = await genreTestUtils.createAndPersist();

    try {
      await commandHandler.execute({
        id: secondGenre.id,
        name: preExistingGenre.name,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Genre',
        name: secondGenre.name,
      });

      return;
    }

    expect.fail();
  });
});
