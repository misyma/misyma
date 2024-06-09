import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type DeleteCollectionCommandHandler } from './deleteCollectionCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

describe('DeleteCollectionCommandHandler', () => {
  let commandHandler: DeleteCollectionCommandHandler;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteCollectionCommandHandler>(symbols.deleteCollectionCommandHandler);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await collectionTestUtils.truncate();
  });

  it('throws an error - when Collection does not exist', async () => {
    const invalidUuid = Generator.uuid();

    await expect(async () => {
      await commandHandler.execute({
        id: invalidUuid,
      });
    }).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Collection',
        id: invalidUuid,
      },
    });
  });

  it('deletes the Collection', async () => {
    const user = await userTestUtils.createAndPersist();

    const collection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    await commandHandler.execute({
      id: collection.id,
    });

    const foundCollection = await collectionTestUtils.findById(collection.id);

    expect(foundCollection).toBeNull();
  });
});
