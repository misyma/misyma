import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/userBookRawEntity.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

import { type FindBookReadingsQueryHandler } from './findBookReadingsQueryHandler.js';

describe('FindBookReadingsQueryHandlerImpl', () => {
  let queryHandler: FindBookReadingsQueryHandler;

  let databaseClient: DatabaseClient;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  const testUserId = Generator.uuid();

  beforeEach(async () => {
    const container = await TestContainer.create();

    queryHandler = container.get<FindBookReadingsQueryHandler>(symbols.findBookReadingsQueryHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

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
      bookReadingTestUtils,
      userBookTestUtils,
    ];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  async function createUserBook(): Promise<UserBookRawEntity> {
    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          category_id: category.id,
        },
      },
    });

    return await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      },
    });
  }

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

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'UserBook',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
  });

  it('returns an empty array - when UserBook has no BookReadings', async () => {
    const userBook = await createUserBook();

    const { bookReadings, total } = await queryHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookReadings.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns Book BookReadings', async () => {
    const userBook = await createUserBook();

    const bookReading1 = await bookReadingTestUtils.createAndPersist({
      input: {
        user_book_id: userBook.id,
      },
    });

    const bookReading2 = await bookReadingTestUtils.createAndPersist({
      input: {
        user_book_id: userBook.id,
      },
    });

    const { bookReadings, total } = await queryHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookReadings.length).toEqual(2);

    expect(bookReadings[0]?.getState()).toEqual({
      userBookId: bookReading1.user_book_id,
      rating: bookReading1.rating,
      comment: bookReading1.comment,
      startedAt: bookReading1.started_at,
      endedAt: bookReading1.ended_at,
    });

    expect(bookReadings[1]?.getState()).toEqual({
      userBookId: bookReading2.user_book_id,
      rating: bookReading2.rating,
      comment: bookReading2.comment,
      startedAt: bookReading2.started_at,
      endedAt: bookReading2.ended_at,
    });

    expect(total).toEqual(2);
  });
});
