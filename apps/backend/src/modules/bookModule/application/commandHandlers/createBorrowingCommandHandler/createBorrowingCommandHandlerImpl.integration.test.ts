import { bookshelfTypes } from '@common/contracts';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { symbols } from '../../../symbols.js';
import { BorrowingTestFactory } from '../../../tests/factories/borrowingTestFactory/borrowingTestFactory.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';

import { type CreateBorrowingCommandHandler } from './createBorrowingCommandHandler.js';

describe('CreateBorrowingCommandHandlerImpl', () => {
  let commandHandler: CreateBorrowingCommandHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const borrowingTestFactory = new BorrowingTestFactory();

  const testUserId = Generator.uuid();

  let testDataOrchestrator: TestDataOrchestrator;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<CreateBorrowingCommandHandler>(symbols.createBorrowingCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [userTestUtils, borrowingTestUtils, userBookTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    testDataOrchestrator.setUserId(testUserId);
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    const borrowing = borrowingTestFactory.create();

    try {
      await commandHandler.execute({
        ...borrowing.getState(),
        userBookId: nonExistentUserBookId,
        userId: testUserId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'UserBook does not exist.',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when startedAt is greater than endedAt', async () => {
    const userBook = await testDataOrchestrator.createUserBook({
      bookshelf: {
        input: {
          type: bookshelfTypes.borrowing,
        },
      },
    });

    const startedAt = new Date('2022-02-01');

    const endedAt = new Date('2022-01-01');

    const borrower = Generator.fullName();

    try {
      await commandHandler.execute({
        borrower,
        userBookId: userBook.id,
        startedAt,
        endedAt,
        userId: testUserId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: `Start date cannot be later than end date.`,
        startedAt,
        endedAt,
      });

      return;
    }

    expect.fail();
  });

  it('creates a Borrowing and moves a UserBook to Borrowing Bookshelf', async () => {
    const userBook = await testDataOrchestrator.createUserBook({
      bookshelf: {
        input: {
          type: bookshelfTypes.borrowing,
        },
      },
    });

    const borrowingDraft = borrowingTestFactory.create({
      userBookId: userBook.id,
    });

    const { borrowing } = await commandHandler.execute({
      ...borrowingDraft.getState(),
      userId: testUserId,
    });

    expect(borrowing).toBeInstanceOf(Borrowing);

    expect(borrowing.getState()).toEqual({
      userBookId: userBook.id,
      borrower: borrowingDraft.getBorrower(),
      startedAt: borrowingDraft.getStartedAt(),
      endedAt: borrowingDraft.getEndedAt(),
    });

    const persistedRawBorrowing = await borrowingTestUtils.findById({
      id: borrowing.getId(),
    });

    expect(persistedRawBorrowing).toMatchObject({
      id: borrowing.getId(),
      userBookId: userBook.id,
      borrower: borrowingDraft.getBorrower(),
      startedAt: borrowingDraft.getStartedAt(),
      endedAt: borrowingDraft.getEndedAt(),
    });

    const persistedUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(persistedUserBook?.bookshelfId).toBe(userBook.bookshelfId);
  });

  it('throws an error - when Borrowing Bookshelf does not exist', async () => {
    const userBook = await testDataOrchestrator.createUserBook({});

    const borrowingDraft = borrowingTestFactory.create({
      userBookId: userBook.id,
    });

    try {
      await commandHandler.execute({
        ...borrowingDraft.getState(),
        userId: testUserId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Borrowing Bookshelf does not exist.',
        userId: testUserId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Bookshelf does not belong to the user', async () => {
    const userBook = await testDataOrchestrator.createUserBook({
      bookshelf: {
        input: {
          type: bookshelfTypes.borrowing,
        },
      },
    });

    const borrowingDraft = borrowingTestFactory.create({
      userBookId: userBook.id,
    });

    const otherUser = await userTestUtils.createAndPersist();

    try {
      await commandHandler.execute({
        ...borrowingDraft.getState(),
        userId: otherUser.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Bookshelf does not belong to the user.',
        bookshelfUserId: testUserId,
        userId: otherUser.id,
      });

      return;
    }

    expect.fail();
  });
});
