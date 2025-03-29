import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

import { type UpdateBorrowingCommandHandler } from './updateBorrowingCommandHandler.js';

describe('UpdateBorrowingCommandHandlerImpl', () => {
  let commandHandler: UpdateBorrowingCommandHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let genreTestUtils: GenreTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateBorrowingCommandHandler>(symbols.updateBorrowingCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    testUtils = [
      genreTestUtils,
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

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const genre = await genreTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
        genreId: genre.id,
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

    expect(persistedUpdatedBorrowing?.startedAt).toEqual(newStartedAt);

    expect(persistedUpdatedBorrowing?.endedAt).toEqual(newEndedAt);
  });
});
