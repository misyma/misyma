import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { symbols } from '../../../symbols.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type UpdateBorrowingCommandHandler } from './updateBorrowingCommandHandler.js';

describe('UpdateBorrowingCommandHandlerImpl', () => {
  let commandHandler: UpdateBorrowingCommandHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateBorrowingCommandHandler>(symbols.updateBorrowingCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    testUtils = [
      categoryTestUtils,
      bookTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      borrowingTestUtils,
      userBookTestUtils,
    ];

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

  it('throws an error - when Borrowing was not found', async () => {
    const user = await userTestUtils.createAndPersist();

    const nonExistentBorrowingId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: user.id,
        borrowingId: nonExistentBorrowingId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Borrowing does not exist.',
        id: nonExistentBorrowingId,
      });

      return;
    }

    expect.fail();
  });

  it('updates a Borrowing', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: user.id } });

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelf_id: bookshelf.id,
        book_id: book.id,
      },
    });

    const borrowing = await borrowingTestUtils.createAndPersist({
      input: {
        user_book_id: userBook.id,
      },
    });

    const newBorrower = Generator.alphaString(20);

    const newStartedAt = Generator.pastDate();

    const newEndedAt = Generator.futureDate();

    const { borrowing: updatedBorrowing } = await commandHandler.execute({
      userId: user.id,
      borrowingId: borrowing.id,
      borrower: newBorrower,
      startedAt: newStartedAt,
      endedAt: newEndedAt,
    });

    expect(updatedBorrowing).toBeInstanceOf(Borrowing);

    expect(updatedBorrowing.getState()).toMatchObject({
      userBookId: userBook.id,
      borrower: newBorrower,
      startedAt: newStartedAt,
      endedAt: newEndedAt,
    });

    const persistedUpdatedBorrowing = await borrowingTestUtils.findById({
      id: borrowing.id,
    });

    expect(persistedUpdatedBorrowing?.id).toEqual(borrowing.id);

    expect(persistedUpdatedBorrowing?.borrower).toEqual(newBorrower);

    expect(persistedUpdatedBorrowing?.started_at).toEqual(newStartedAt);

    expect(persistedUpdatedBorrowing?.ended_at).toEqual(newEndedAt);
  });
});
