import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookReadingsByBookIdQueryHandler } from './findBookReadingsByBookIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('FindBookReadingsByBookIdQueryHandlerImpl', () => {
  let queryHandler: FindBookReadingsByBookIdQueryHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookReadingsByBookIdQueryHandler>(symbols.findBookReadingsByBookIdQueryHandler);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();
  });

  it('throws an error - when Book was not found', async () => {
    const nonExistentBookId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          bookId: nonExistentBookId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Book',
        id: nonExistentBookId,
      },
    });
  });

  it('returns an empty array - when Book has no BookReadings', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          bookshelfId: bookshelf.id,
        },
      },
    });

    const result = await queryHandler.execute({
      bookId: book.id,
    });

    expect(result.bookReadings.length).toEqual(0);
  });

  it('returns Book BookReadings', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          bookshelfId: bookshelf.id,
        },
      },
    });

    const bookReading1 = await bookReadingTestUtils.createAndPersist({
      input: {
        bookId: book.id,
      },
    });

    const bookReading2 = await bookReadingTestUtils.createAndPersist({
      input: {
        bookId: book.id,
      },
    });

    const result = await queryHandler.execute({
      bookId: book.id,
    });

    expect(result.bookReadings.length).toEqual(2);

    expect(result.bookReadings[0]?.getState()).toEqual({
      id: bookReading1.id,
      bookId: bookReading1.bookId,
      rating: bookReading1.rating,
      comment: bookReading1.comment,
      startedAt: bookReading1.startedAt,
      endedAt: bookReading1.endedAt,
    });

    expect(result.bookReadings[1]?.getState()).toEqual({
      id: bookReading2.id,
      bookId: bookReading2.bookId,
      rating: bookReading2.rating,
      comment: bookReading2.comment,
      startedAt: bookReading2.startedAt,
      endedAt: bookReading2.endedAt,
    });
  });
});
