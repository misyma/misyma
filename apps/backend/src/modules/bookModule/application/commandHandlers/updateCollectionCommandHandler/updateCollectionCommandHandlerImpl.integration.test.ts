import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

import { type UpdateCollectionCommandHandler } from './updateCollectionCommandHandler.js';

describe('UpdateCollectionNameCommandHandler', () => {
  let commandHandler: UpdateCollectionCommandHandler;

  let databaseClient: DatabaseClient;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateCollectionCommandHandler>(symbols.updateCollectionCommandHandler);

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
    const collectionId = Generator.uuid();

    try {
      await commandHandler.execute({
        id: collectionId,
        name: Generator.words(2),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Collection does not exist.',
        id: collectionId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Collection with given name already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const preExistingCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const secondCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    try {
      await commandHandler.execute({
        id: preExistingCollection.id,
        name: secondCollection.name,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toMatchObject({
        resource: 'Collection',
        name: secondCollection.name,
      });

      return;
    }

    expect.fail();
  });

  it('updates the Collection name', async () => {
    const user = await userTestUtils.createAndPersist();

    const collection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const newName = Generator.words(2);

    const { collection: updatedCollection } = await commandHandler.execute({
      id: collection.id,
      name: newName,
    });

    const foundCollection = await collectionTestUtils.findById(collection.id);

    expect(foundCollection?.name).toEqual(newName);

    expect(updatedCollection.getName()).toEqual(newName);
  });
});
