import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type CreateBorrowingCommandHandler } from './createBorrowingCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
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

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const borrowingTestFactory = new BorrowingTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBorrowingCommandHandler>(symbols.createBorrowingCommandHandler);

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

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    const borrowing = borrowingTestFactory.create();

    expect(
      async () =>
        await commandHandler.execute({
          ...borrowing.getState(),
          userBookId: nonExistentUserBookId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'UserBook',
        id: nonExistentUserBookId,
      },
    });
  });

  it('returns a Borrowing', async () => {
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

    const { borrowing } = await commandHandler.execute({
      ...borrowingDraft.getState(),
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
  });
});
