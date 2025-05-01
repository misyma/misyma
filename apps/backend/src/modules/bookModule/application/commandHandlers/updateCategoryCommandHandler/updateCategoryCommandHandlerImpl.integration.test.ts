import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type UpdateCategoryCommandHandler } from './updateCategoryCommandHandler.js';

describe('UpdateCategoryCommandHandler', () => {
  let commandHandler: UpdateCategoryCommandHandler;

  let databaseClient: DatabaseClient;

  let categoryTestUtils: CategoryTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateCategoryCommandHandler>(symbols.updateCategoryCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    await categoryTestUtils.truncate();
  });

  afterEach(async () => {
    await categoryTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Category does not exist', async () => {
    const categoryId = Generator.uuid();

    try {
      await commandHandler.execute({
        id: categoryId,
        name: Generator.words(2),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Category does not exist.',
        id: categoryId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Category with given name already exists', async () => {
    const preExistingCategory = await categoryTestUtils.createAndPersist();

    const secondCategory = await categoryTestUtils.createAndPersist();

    try {
      await commandHandler.execute({
        id: preExistingCategory.id,
        name: secondCategory.name,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Category',
        name: secondCategory.name,
      });

      return;
    }

    expect.fail();
  });
});
