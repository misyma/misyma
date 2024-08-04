import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BookshelfType } from '@common/contracts';

import { type CreateBorrowingCommandHandler } from './createBorrowingCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { symbols } from '../../../symbols.js';
import { BorrowingTestFactory } from '../../../tests/factories/borrowingTestFactory/borrowingTestFactory.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';

describe('CreateBorrowingCommandHandlerImpl', () => {
  let commandHandler: CreateBorrowingCommandHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const borrowingTestFactory = new BorrowingTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBorrowingCommandHandler>(symbols.createBorrowingCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [bookTestUtils, bookshelfTestUtils, userTestUtils, borrowingTestUtils, userBookTestUtils];

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

  it('throws an error - when UserBook does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const nonExistentUserBookId = Generator.uuid();

    const borrowing = borrowingTestFactory.create();

    try {
      await commandHandler.execute({
        ...borrowing.getState(),
        userBookId: nonExistentUserBookId,
        userId: user.id,
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
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
        type: BookshelfType.borrowing,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
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
        userId: user.id,
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
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const borrowingBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
        type: BookshelfType.borrowing,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const borrowingDraft = borrowingTestFactory.create({
      userBookId: userBook.id,
    });

    const { borrowing } = await commandHandler.execute({
      ...borrowingDraft.getState(),
      userId: user.id,
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

    expect(persistedUserBook?.bookshelfId).toBe(borrowingBookshelf.id);
  });

  it('throws an error - when Borrowing Bookshelf does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const borrowingDraft = borrowingTestFactory.create({
      userBookId: userBook.id,
    });

    try {
      await commandHandler.execute({
        ...borrowingDraft.getState(),
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Borrowing Bookshelf does not exist.',
        userId: user.id,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Bookshelf does not belong to the user', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
        type: BookshelfType.borrowing,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
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
        bookshelfUserId: bookshelf.userId,
        userId: otherUser.id,
      });

      return;
    }

    expect.fail();
  });
});
