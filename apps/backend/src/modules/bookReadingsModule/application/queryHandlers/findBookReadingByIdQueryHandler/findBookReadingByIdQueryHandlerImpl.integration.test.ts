import { describe, it, beforeEach, expect, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookReadingByIdQueryHandler } from './findBookReadingByIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('FindBookReadingByIdQueryHandler', () => {
  let queryHandler: FindBookReadingByIdQueryHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookReadingByIdQueryHandler>(symbols.findBookReadingByIdQueryHandler);

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

  it('throws an error - when BookReading was not found', async () => {
    const nonExistentBookReadingId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          id: nonExistentBookReadingId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'BookReading',
      },
    });
  });

  it('returns a BookReading', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const createdBookReading = await bookReadingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const { bookReading } = await queryHandler.execute({
      id: createdBookReading.id,
    });

    expect(bookReading).toBeInstanceOf(BookReading);

    expect(bookReading?.getId()).toEqual(createdBookReading.id);

    expect(bookReading?.getState()).toEqual({
      userBookId: userBook.id,
      rating: createdBookReading.rating,
      comment: createdBookReading.comment,
      startedAt: createdBookReading.startedAt,
      endedAt: createdBookReading.endedAt,
    });
  });
});
