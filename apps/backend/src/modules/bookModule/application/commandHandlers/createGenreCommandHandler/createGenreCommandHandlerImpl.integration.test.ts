import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type CreateCategoryCommandHandler } from './createCategoryCommandHandler.js';

describe('CreateCategoryCommandHandlerImpl', () => {
  let commandHandler: CreateCategoryCommandHandler;

  let databaseClient: DatabaseClient;

  let categoryTestUtils: CategoryTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<CreateCategoryCommandHandler>(symbols.createCategoryCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    await categoryTestUtils.truncate();
  });

  afterEach(async () => {
    await categoryTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Category already exists', async () => {
    const category = await categoryTestUtils.createAndPersist();

    try {
      await commandHandler.execute({ name: category.name });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Category',
        name: category.name,
      });

      return;
    }

    expect.fail();
  });

  it('creates Category', async () => {
    const categoryName = Generator.words(2);

    const { category } = await commandHandler.execute({ name: categoryName });

    expect(category.getName()).toEqual(categoryName);

    const persistedCategory = await categoryTestUtils.findByName(categoryName);

    expect(persistedCategory).not.toBeNull();

    expect(persistedCategory?.id).toEqual(category.getId());

    expect(persistedCategory?.name).toEqual(category.getName());
  });
});
