import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Borrowing } from '../../../domain/entities/borrowing/borrowing.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { symbols } from '../../../symbols.js';
import { BorrowingTestFactory } from '../../../tests/factories/borrowingTestFactory/borrowingTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('BorrowingRepositoryImpl', () => {
  let repository: BorrowingRepository;

  let borrowingTestUtils: BorrowingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const borrowingTestFactory = new BorrowingTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    repository = container.get<BorrowingRepository>(symbols.borrowingRepository);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [bookTestUtils, bookshelfTestUtils, userTestUtils, borrowingTestUtils, userBookTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
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
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const borrowing = await borrowingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const result = await repository.findBorrowing({
        id: borrowing.id,
      });

      expect(result).toBeInstanceOf(Borrowing);

      expect(result?.getState()).toEqual({
        userBookId: userBook.id,
        borrower: borrowing.borrower,
        startedAt: borrowing.startedAt,
        endedAt: borrowing.endedAt,
      });
    });
  });

  describe('findByUserBookId', () => {
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
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const borrowing1 = await borrowingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const borrowing2 = await borrowingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
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
  });

  describe('save', () => {
    it('creates a new Borrowing - given BorrowingDraft', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

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
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const borrowingRawEntity = await borrowingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const borrowing = new Borrowing(borrowingRawEntity);

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
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const borrowingRawEntity = await borrowingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const borrowing = new Borrowing({
        id: borrowingRawEntity.id,
        userBookId: userBook.id,
        borrower: borrowingRawEntity.borrower,
        startedAt: borrowingRawEntity.startedAt,
        endedAt: borrowingRawEntity.endedAt,
      });

      await repository.deleteBorrowing({
        id: borrowing.getId(),
      });

      const result = await repository.findBorrowing({
        id: borrowing.getId(),
      });

      expect(result).toBeNull();
    });
  });
});
