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
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

import { type UpdateBookReadingCommandHandler } from './updateBookReadingCommandHandler.js';

describe('UpdateBookReadingCommandHandlerImpl', () => {
  let commandHandler: UpdateBookReadingCommandHandler;

  let databaseClient: DatabaseClient;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let genreTestUtils: GenreTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateBookReadingCommandHandler>(symbols.updateBookReadingCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

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
      bookReadingTestUtils,
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

  it('throws an error - when BookReading was not found', async () => {
    const user = await userTestUtils.createAndPersist();

    const nonExistentBookReadingId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookReadingId: nonExistentBookReadingId,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'BookReading does not exist.',
        id: nonExistentBookReadingId,
      });

      return;
    }

    expect.fail();
  });

  it('updates a BookReading', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const genre = await genreTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          genreId: genre.id
        }
      },
    });

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
      userId: user.id,
      bookReadingId: bookReading.id,
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
