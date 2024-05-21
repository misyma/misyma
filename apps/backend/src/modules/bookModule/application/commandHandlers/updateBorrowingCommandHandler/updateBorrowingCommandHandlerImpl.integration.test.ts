import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateBorrowingCommandHandler } from './updateBorrowingCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { symbols } from '../../../symbols.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';

describe('UpdateBorrowingCommandHandlerImpl', () => {
  let commandHandler: UpdateBorrowingCommandHandler;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBorrowingCommandHandler>(symbols.updateBorrowingCommandHandler);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await borrowingTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await borrowingTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  it('throws an error - when Borrowing was not found', async () => {
    const nonExistentBorrowingId = Generator.uuid();

    expect(
      async () =>
        await commandHandler.execute({
          id: nonExistentBorrowingId,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Borrowing does not exist.',
        id: nonExistentBorrowingId,
      },
    });
  });

  it('updates a Borrowing', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const borrowing = await borrowingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const newBorrower = Generator.alphaString(20);

    const newStartedAt = Generator.pastDate();

    const newEndedAt = Generator.futureDate();

    const { borrowing: updatedBorrowing } = await commandHandler.execute({
      id: borrowing.id,
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

    expect(persistedUpdatedBorrowing?.startedAt).toEqual(newStartedAt);

    expect(persistedUpdatedBorrowing?.endedAt).toEqual(newEndedAt);
  });
});
