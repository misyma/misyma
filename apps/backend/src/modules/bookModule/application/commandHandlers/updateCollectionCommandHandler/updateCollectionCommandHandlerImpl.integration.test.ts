import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateCollectionCommandHandler } from './updateCollectionCommandHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

describe('UpdateCollectionNameCommandHandler', () => {
  let commandHandler: UpdateCollectionCommandHandler;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateCollectionCommandHandler>(symbols.updateCollectionCommandHandler);

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
  });

  it('throws an error - when Collection does not exist', async () => {
    const collectionId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          id: collectionId,
          name: Generator.words(2),
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Collection does not exist.',
        id: collectionId,
      },
    });
  });

  it('throws an error - when Collection with given name already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const preExistingCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const secondCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    await expect(
      async () =>
        await commandHandler.execute({
          id: preExistingCollection.id,
          name: secondCollection.name,
        }),
    ).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        resource: 'Collection',
        name: secondCollection.name,
      },
    });
  });
});
