import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookReadingsByUserBookIdQueryHandler } from './findBookReadingsByUserBookIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('FindBookReadingsByUserBookIdQueryHandlerImpl', () => {
  let queryHandler: FindBookReadingsByUserBookIdQueryHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookReadingsByUserBookIdQueryHandler>(
      symbols.findBookReadingsByUserBookIdQueryHandler,
    );

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  it('throws an error - when UserBook was not found', async () => {
    const nonExistentUserBookId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          userBookId: nonExistentUserBookId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Book',
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

    const result = await queryHandler.execute({
      userBookId: userBook.id,
    });

    expect(result.bookReadings.length).toEqual(0);
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

    const result = await queryHandler.execute({
      userBookId: userBook.id,
    });

    expect(result.bookReadings.length).toEqual(2);

    expect(result.bookReadings[0]?.getState()).toEqual({
      userBookId: bookReading1.userBookId,
      rating: bookReading1.rating,
      comment: bookReading1.comment,
      startedAt: bookReading1.startedAt,
      endedAt: bookReading1.endedAt,
    });

    expect(result.bookReadings[1]?.getState()).toEqual({
      userBookId: bookReading2.userBookId,
      rating: bookReading2.rating,
      comment: bookReading2.comment,
      startedAt: bookReading2.startedAt,
      endedAt: bookReading2.endedAt,
    });
  });
});
