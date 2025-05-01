import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { symbols } from '../../../symbols.js';
import { BorrowingTestFactory } from '../../../tests/factories/borrowingTestFactory/borrowingTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('BorrowingRepositoryImpl', () => {
  let repository: BorrowingRepository;

  let databaseClient: DatabaseClient;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const borrowingTestFactory = new BorrowingTestFactory();

  let testDataOrchestrator: TestDataOrchestrator;

  const testUserId = Generator.uuid();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    repository = container.get<BorrowingRepository>(symbols.borrowingRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [bookTestUtils, userTestUtils, borrowingTestUtils, userBookTestUtils];

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

  describe('findById', () => {
    it('returns null - when Borrowing was not found', async () => {
      const nonExistentBorrowingId = Generator.uuid();

      const result = await repository.findBorrowing({
        id: nonExistentBorrowingId,
      });

      expect(result).toBeNull();
    });

    it('returns a Borrowing', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const result = await repository.findBorrowing({
        id: borrowing.id,
      });

      expect(result).toBeInstanceOf(Borrowing);

      expect(result?.getState()).toEqual({
        userBookId: userBook.id,
        borrower: borrowing.borrower,
        startedAt: borrowing.started_at,
        endedAt: borrowing.ended_at,
      });
    });
  });

  describe('findBorrowings', () => {
    it('returns an empty array - when Borrowings were not found', async () => {
      const userBookId = Generator.uuid();

      const result = await repository.findBorrowings({
        userBookId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(0);
    });

    it('returns an array of Borrowings', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const borrowing2 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const result = await repository.findBorrowings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(2);

      result.forEach((borrowing) => {
        expect(borrowing).toBeInstanceOf(Borrowing);

        expect(borrowing.getId()).oneOf([borrowing1.id, borrowing2.id]);

        expect(borrowing.getUserBookId()).toEqual(userBook.id);
      });
    });

    it('returns an array of Borrowings - with pagination', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const result = await repository.findBorrowings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 1,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(borrowing1.id);
    });

    it('returns an array of Borrowings - sorted by startedAt date', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          started_at: new Date('2021-01-01'),
        },
      });

      const borrowing2 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          started_at: new Date('2021-01-02'),
        },
      });

      const result = await repository.findBorrowings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
        sortDate: 'desc',
      });

      expect(result).toHaveLength(2);

      expect(result[0]?.getId()).toEqual(borrowing2.id);

      expect(result[1]?.getId()).toEqual(borrowing1.id);
    });

    it('returns an array of Borrowings - filtered by isOpen', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          ended_at: undefined,
        },
      });

      await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          ended_at: new Date(),
        },
      });

      const result = await repository.findBorrowings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
        isOpen: true,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(borrowing1.id);
    });

    it('returns an array of Borrowings - filtered by not isOpen', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          ended_at: undefined,
        },
      });

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          ended_at: new Date(),
        },
      });

      const result = await repository.findBorrowings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
        isOpen: false,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(borrowing1.id);
    });
  });

  describe('save', () => {
    it('creates a new Borrowing - given BorrowingDraft', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowing = borrowingTestFactory.create({
        userBookId: userBook.id,
      });

      const result = await repository.saveBorrowing({
        borrowing: borrowing.getState(),
      });

      expect(result).toBeInstanceOf(Borrowing);

      expect(result.getUserBookId()).toEqual(userBook.id);

      expect(result.getBorrower()).toEqual(borrowing.getBorrower());
    });

    it('updates a Borrowing - given a Borrowing', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowingRawEntity = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const borrowing = new Borrowing({
        id: borrowingRawEntity.id,
        userBookId: userBook.id,
        borrower: borrowingRawEntity.borrower,
        startedAt: borrowingRawEntity.started_at,
        endedAt: borrowingRawEntity.ended_at,
      });

      const newBorrower = Generator.alphaString(20);

      const newStartedAt = Generator.pastDate();

      const newEndedAt = Generator.futureDate();

      borrowing.setBorrower({
        borrower: newBorrower,
      });

      borrowing.setStartedAtDate({
        startedAt: newStartedAt,
      });

      borrowing.setEndedAtDate({
        endedAt: newEndedAt,
      });

      const result = await repository.saveBorrowing({
        borrowing,
      });

      expect(result).toBeInstanceOf(Borrowing);

      const updatedBorrowing = await repository.findBorrowing({
        id: borrowing.getId(),
      });

      expect(updatedBorrowing?.getBorrower()).toEqual(newBorrower);

      expect(updatedBorrowing?.getStartedAt()).toEqual(newStartedAt);

      expect(updatedBorrowing?.getEndedAt()).toEqual(newEndedAt);
    });
  });

  describe('delete', () => {
    it('deletes a Borrowing', async () => {
      const userBook = await testDataOrchestrator.createUserBook();

      const borrowingRawEntity = await borrowingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      await repository.deleteBorrowing({ id: borrowingRawEntity.id });

      const result = await repository.findBorrowing({ id: borrowingRawEntity.id });

      expect(result).toBeNull();
    });
  });
});
