import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindBorrowingsQueryHandler } from './findBorrowingsQueryHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('FindBorrowingsQueryHandlerImpl', () => {
  let queryHandler: FindBorrowingsQueryHandler;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBorrowingsQueryHandler>(symbols.findBorrowingsQueryHandler);

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
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const genre = await genreTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
        genreId: genre.id,
      },
    });

    const { borrowings, total } = await queryHandler.execute({
      userId: user.id,
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(borrowings.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns Book Borrowings', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const genre = await genreTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
        genreId: genre.id,
      },
    });

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
      userId: user.id,
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
