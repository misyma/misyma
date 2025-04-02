import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';

import { type FindBorrowingsQueryHandler } from './findBorrowingsQueryHandler.js';

describe('FindBorrowingsQueryHandlerImpl', () => {
  let queryHandler: FindBorrowingsQueryHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let userTestUtils: UserTestUtils;

  let orchestrator: TestDataOrchestrator;

  let testUtils: TestUtils[];

  const testUserId = Generator.uuid();

  beforeEach(async () => {
    const container = await TestContainer.create();

    queryHandler = container.get<FindBorrowingsQueryHandler>(symbols.findBorrowingsQueryHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    orchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [userTestUtils, borrowingTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await orchestrator.cleanup();

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    orchestrator.setUserId(testUserId);
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when UserBook was not found', async () => {
    const user = await userTestUtils.createAndPersist();

    const nonExistentUserBookId = Generator.uuid();

    try {
      await queryHandler.execute({
        userId: user.id,
        userBookId: nonExistentUserBookId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toMatchObject({
        resource: 'UserBook',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
  });

  it('returns an empty array - when UserBook has no Borrowings', async () => {
    const userBook = await orchestrator.createUserBook();

    const { borrowings, total } = await queryHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(borrowings.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns Book Borrowings', async () => {
    const userBook = await orchestrator.createUserBook();

    const borrowing1 = await borrowingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const borrowing2 = await borrowingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const { borrowings, total } = await queryHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(borrowings.length).toEqual(2);

    expect(borrowings[0]?.getState()).toEqual({
      userBookId: borrowing1.userBookId,
      borrower: borrowing1.borrower,
      startedAt: borrowing1.startedAt,
      endedAt: borrowing1.endedAt,
    });

    expect(borrowings[1]?.getState()).toEqual({
      userBookId: borrowing2.userBookId,
      borrower: borrowing2.borrower,
      startedAt: borrowing2.startedAt,
      endedAt: borrowing2.endedAt,
    });

    expect(total).toEqual(2);
  });
});
