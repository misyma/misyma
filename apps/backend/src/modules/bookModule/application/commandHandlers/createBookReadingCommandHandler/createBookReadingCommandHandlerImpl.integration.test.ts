import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { symbols } from '../../../symbols.js';
import { BookReadingTestFactory } from '../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';

import { type CreateBookReadingCommandHandler } from './createBookReadingCommandHandler.js';

describe('CreateBookReadingCommandHandlerImpl', () => {
  let commandHandler: CreateBookReadingCommandHandler;

  let databaseClient: DatabaseClient;

  let bookReadingTestUtils: BookReadingTestUtils;

  let userTestUtils: UserTestUtils;

  let testDataOrchestrator: TestDataOrchestrator;

  const testUserId = Generator.uuid();

  const bookReadingTestFactory = new BookReadingTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<CreateBookReadingCommandHandler>(symbols.createBookReadingCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [userTestUtils, bookReadingTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    testDataOrchestrator.setUserId(testUserId);
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
        userId: testUserId,
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
    const userBook = await testDataOrchestrator.createUserBook();

    const bookReadingDraft = bookReadingTestFactory.create({
      userBookId: userBook.id,
      startedAt: Generator.futureDate(),
      endedAt: Generator.pastDate(),
    });

    try {
      await commandHandler.execute({
        ...bookReadingDraft.getState(),
        userId: testUserId,
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
    const userBook = await testDataOrchestrator.createUserBook();

    const bookReadingDraft = bookReadingTestFactory.create({
      userBookId: userBook.id,
    });

    const { bookReading } = await commandHandler.execute({
      ...bookReadingDraft.getState(),
      userId: testUserId,
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
      user_book_id: userBook.id,
      comment: bookReadingDraft.getComment(),
      rating: bookReadingDraft.getRating(),
      started_at: bookReadingDraft.getStartedAt(),
      ended_at: bookReadingDraft.getEndedAt(),
    });
  });
});
