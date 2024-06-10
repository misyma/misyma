import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindBookReadingsQueryHandler } from './findBookReadingsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('FindBookReadingsQueryHandlerImpl', () => {
  let queryHandler: FindBookReadingsQueryHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookReadingsQueryHandler>(symbols.findBookReadingsQueryHandler);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [bookTestUtils, bookshelfTestUtils, userTestUtils, bookReadingTestUtils, userBookTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  it('throws an error - when UserBook was not found', async () => {
    const nonExistentUserBookId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          userBookId: nonExistentUserBookId,
          page: 1,
          pageSize: 10,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'UserBook',
        id: nonExistentUserBookId,
      },
    });
  });

  it('returns an empty array - when UserBook has no BookReadings', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const { bookReadings, total } = await queryHandler.execute({
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookReadings.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns Book BookReadings', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const bookReading1 = await bookReadingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const bookReading2 = await bookReadingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const { bookReadings, total } = await queryHandler.execute({
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookReadings.length).toEqual(2);

    expect(bookReadings[0]?.getState()).toEqual({
      userBookId: bookReading1.userBookId,
      rating: bookReading1.rating,
      comment: bookReading1.comment,
      startedAt: bookReading1.startedAt,
      endedAt: bookReading1.endedAt,
    });

    expect(bookReadings[1]?.getState()).toEqual({
      userBookId: bookReading2.userBookId,
      rating: bookReading2.rating,
      comment: bookReading2.comment,
      startedAt: bookReading2.startedAt,
      endedAt: bookReading2.endedAt,
    });

    expect(total).toEqual(2);
  });
});
