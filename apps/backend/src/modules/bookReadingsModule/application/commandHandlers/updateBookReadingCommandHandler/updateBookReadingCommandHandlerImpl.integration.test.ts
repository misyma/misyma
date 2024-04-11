import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type UpdateBookReadingCommandHandler } from './updateBookReadingCommandHandler.js';
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

describe('UpdateBookReadingCommandHandlerImpl', () => {
  let commandHandler: UpdateBookReadingCommandHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBookReadingCommandHandler>(symbols.updateBookReadingNameCommandHandler);

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
        await commandHandler.execute({
          id: nonExistentBookReadingId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'BookReading',
        id: nonExistentBookReadingId,
      },
    });
  });

  it('updates a BookReading', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const bookReading = await bookReadingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const newComment = Generator.alphaString(20);

    const newRating = Generator.number(5);

    const newStartedAt = Generator.pastDate();

    const newEndedAt = Generator.futureDate();

    const { bookReading: updatedBookReading } = await commandHandler.execute({
      id: bookReading.id,
      comment: newComment,
      rating: newRating,
      startedAt: newStartedAt,
      endedAt: newEndedAt,
    });

    expect(updatedBookReading).toBeInstanceOf(BookReading);

    expect(updatedBookReading.getState()).toMatchObject({
      userBookId: userBook.id,
      comment: newComment,
      rating: newRating,
      startedAt: newStartedAt,
      endedAt: newEndedAt,
    });

    const persistedUpdatedBookReading = await bookReadingTestUtils.findById({
      id: bookReading.id,
    });

    expect(persistedUpdatedBookReading?.id).toEqual(bookReading.id);

    expect(persistedUpdatedBookReading?.comment).toEqual(newComment);

    expect(persistedUpdatedBookReading?.rating).toEqual(newRating);

    expect(persistedUpdatedBookReading?.startedAt).toEqual(newStartedAt);

    expect(persistedUpdatedBookReading?.endedAt).toEqual(newEndedAt);
  });
});
