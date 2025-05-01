import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type DeleteCategoryCommandHandler } from './deleteCategoryCommandHandler.js';

describe('DeleteCategoryCommandHandler', () => {
  let commandHandler: DeleteCategoryCommandHandler;

  let databaseClient: DatabaseClient;

  let categoryTestUtils: CategoryTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<DeleteCategoryCommandHandler>(symbols.deleteCategoryCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    await categoryTestUtils.truncate();
  });

  afterEach(async () => {
    await categoryTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Category does not exist', async () => {
    const invalidUuid = Generator.uuid();

    try {
      await commandHandler.execute({
        id: invalidUuid,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Category',
        id: invalidUuid,
      });

      return;
    }

    expect.fail();
  });

  it('deletes the Category', async () => {
    const category = await categoryTestUtils.createAndPersist();

    await commandHandler.execute({
      id: category.id,
    });

    const foundCategory = await categoryTestUtils.findById(category.id);

    expect(foundCategory).toBeNull();
  });
});
