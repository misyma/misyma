import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindCollectionsQueryHandler } from './findCollectionsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';

describe('FindCollectionsQueryHandlerImpl', () => {
  let queryHandler: FindCollectionsQueryHandler;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindCollectionsQueryHandler>(symbols.findCollectionsQueryHandler);

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

  it('returns an empty array - when User has no Collections', async () => {
    const user = await userTestUtils.createAndPersist();

    const { collections, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(collections.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns User Collections', async () => {
    const user = await userTestUtils.createAndPersist();

    const collection1 = await collectionTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const collection2 = await collectionTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const { collections, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(collections.length).toEqual(2);

    [collection1, collection2].forEach((collection) => {
      expect(collections.find((c) => c.getState().name === collection.name)).toBeDefined();
    });

    expect(total).toEqual(2);
  });
});
