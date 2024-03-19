import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateBookReadingCommandHandler } from './createBookReadingCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { symbols } from '../../../symbols.js';
import { BookReadingTestFactory } from '../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('CreateBookReadingCommandHandlerImpl', () => {
  let commandHandler: CreateBookReadingCommandHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const bookReadingTestFactory = new BookReadingTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBookReadingCommandHandler>(symbols.createBookReadingCommandHandler);

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

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    const bookReading = bookReadingTestFactory.create();

    expect(
      async () =>
        await commandHandler.execute({
          ...bookReading.getState(),
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

  it('returns a BookReading', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const bookReadingDraft = bookReadingTestFactory.create({
      userBookId: userBook.id,
    });

    const { bookReading } = await commandHandler.execute({
      ...bookReadingDraft.getState(),
    });

    expect(bookReading).toBeInstanceOf(BookReading);

    expect(bookReading.getState()).toEqual({
      userBookId: userBook.id,
      comment: bookReadingDraft.getComment(),
      rating: bookReadingDraft.getRating(),
      startedAt: bookReadingDraft.getStartedAt(),
      endedAt: bookReadingDraft.getEndedAt(),
    });

    const persistedRawBookReading = await bookReadingTestUtils.findById({
      id: bookReading.getId(),
    });

    expect(persistedRawBookReading).toMatchObject({
      id: bookReading.getId(),
      userBookId: userBook.id,
      comment: bookReadingDraft.getComment(),
      rating: bookReadingDraft.getRating(),
      startedAt: bookReadingDraft.getStartedAt(),
      endedAt: bookReadingDraft.getEndedAt(),
    });
  });
});
