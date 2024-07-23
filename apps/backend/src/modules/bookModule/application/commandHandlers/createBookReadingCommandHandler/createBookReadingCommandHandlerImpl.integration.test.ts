import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type CreateBookReadingCommandHandler } from './createBookReadingCommandHandler.js';
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
import { BookReadingTestFactory } from '../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('CreateBookReadingCommandHandlerImpl', () => {
  let commandHandler: CreateBookReadingCommandHandler;

  let databaseClient: DatabaseClient;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const bookReadingTestFactory = new BookReadingTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBookReadingCommandHandler>(symbols.createBookReadingCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

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

    await databaseClient.destroy();
  });

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    const bookReading = bookReadingTestFactory.create();

    try {
      await commandHandler.execute({
        ...bookReading.getState(),
        userBookId: nonExistentUserBookId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'UserBook does not exist.',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when startDate is later then endDate', async () => {
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
      startedAt: Generator.futureDate(),
      endedAt: Generator.pastDate(),
    });

    try {
      await commandHandler.execute({
        ...bookReadingDraft.getState(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Start date cannot be later than end date.',
      });

      return;
    }

    expect.fail();
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
