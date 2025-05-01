import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

import { type DeleteCollectionCommandHandler } from './deleteCollectionCommandHandler.js';

describe('DeleteCollectionCommandHandler', () => {
  let commandHandler: DeleteCollectionCommandHandler;

  let databaseClient: DatabaseClient;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<DeleteCollectionCommandHandler>(symbols.deleteCollectionCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [userTestUtils, collectionTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when Collection does not exist', async () => {
    const invalidUuid = Generator.uuid();

    try {
      await commandHandler.execute({
        id: invalidUuid,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Collection',
        id: invalidUuid,
      });

      return;
    }

    expect.fail();
  });

  it('deletes the Collection', async () => {
    const user = await userTestUtils.createAndPersist();

    const collection = await collectionTestUtils.createAndPersist({ input: { user_id: user.id } });

    await commandHandler.execute({
      id: collection.id,
    });

    const foundCollection = await collectionTestUtils.findById(collection.id);

    expect(foundCollection).toBeNull();
  });
});
