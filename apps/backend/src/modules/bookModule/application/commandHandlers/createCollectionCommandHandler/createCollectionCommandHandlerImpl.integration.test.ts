import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type CreateCollectionCommandHandler } from './createCollectionCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

describe('CreateCollectionCommandHandlerImpl', () => {
  let commandHandler: CreateCollectionCommandHandler;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateCollectionCommandHandler>(symbols.createCollectionCommandHandler);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await collectionTestUtils.truncate();

    await collectionTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Collection already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const collection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    await expect(
      async () =>
        await commandHandler.execute({
          name: collection.name,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        resource: 'Collection',
        name: collection.name,
      },
    });
  });

  it('creates Collection', async () => {
    const collectionName = Generator.words(2);

    const user = await userTestUtils.createAndPersist();

    const { collection } = await commandHandler.execute({
      name: collectionName,
      userId: user.id,
    });

    expect(collection.getName()).toEqual(collectionName);

    expect(collection.getUserId()).toEqual(user.id);

    const persistedCollection = await collectionTestUtils.findByName(collectionName);

    expect(persistedCollection).not.toBeNull();

    expect(persistedCollection?.id).toEqual(collection.getId());

    expect(persistedCollection?.name).toEqual(collection.getName());

    expect(persistedCollection?.userId).toEqual(collection.getUserId());
  });
});
