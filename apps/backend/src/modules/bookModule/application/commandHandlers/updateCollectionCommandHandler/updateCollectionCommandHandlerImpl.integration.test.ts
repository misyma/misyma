import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateCollectionCommandHandler } from './updateCollectionCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

describe('UpdateCollectionNameCommandHandler', () => {
  let commandHandler: UpdateCollectionCommandHandler;

  let collectionTestUtils: CollectionTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateCollectionCommandHandler>(symbols.updateCollectionCommandHandler);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);
  });

  afterEach(async () => {
    await collectionTestUtils.truncate();

    await collectionTestUtils.destroyDatabaseConnection();
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
    const preExistingCollection = await collectionTestUtils.createAndPersist();

    const secondCollection = await collectionTestUtils.createAndPersist();

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
