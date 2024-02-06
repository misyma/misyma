import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { symbols } from '../../../symbols.js';
import { BookReadingTestFactory } from '../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('BookReadingRepositoryImpl', () => {
  let repository: BookReadingRepository;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  const bookReadingTestFactory = BookReadingTestFactory.createFactory();

  beforeEach(() => {
    const container = TestContainer.create();

    repository = container.get<BookReadingRepository>(symbols.bookReadingRepository);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    afterEach(async () => {
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

    describe('findById', () => {
      it('returns null - when BookReading was not found', async () => {
        const nonExistentBookReadingId = Generator.uuid();

        const result = await repository.findById({
          id: nonExistentBookReadingId,
        });

        expect(result).toBeNull();
      });

      it('returns a BookReading', async () => {
        const user = await userTestUtils.createAndPersist();

        const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

        const book = await bookTestUtils.createAndPersist({
          input: {
            book: {
              bookshelfId: bookshelf.id,
            },
          },
        });

        const bookReading = await bookReadingTestUtils.createAndPersist({
          input: {
            bookId: book.id,
          },
        });

        const result = await repository.findById({
          id: bookReading.id,
        });

        expect(result).toBeInstanceOf(BookReading);

        expect(result?.getState()).toEqual(bookReading);
      });
    });

    describe('findByBookId', () => {
      it('returns an empty array - when BookReadings were not found', async () => {
        const bookId = Generator.uuid();

        const result = await repository.findByBookId({
          bookId,
        });

        expect(result).toHaveLength(0);
      });

      it('returns an array of BookReadings', async () => {
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

        const result = await repository.findByBookId({
          bookId: book.id,
        });

        expect(result).toHaveLength(2);

        result.forEach((bookReading) => {
          expect(bookReading).toBeInstanceOf(BookReading);

          expect(bookReading.getId()).oneOf([bookReading1.id, bookReading2.id]);

          expect(bookReading.getBookId()).toEqual(user.id);
        });
      });
    });

    describe('save', () => {
      it('creates a new BookReading - given BookReadingDraft', async () => {
        const user = await userTestUtils.createAndPersist();

        const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

        const book = await bookTestUtils.createAndPersist({
          input: {
            book: {
              bookshelfId: bookshelf.id,
            },
          },
        });

        const bookReadingDraft = bookReadingTestFactory.createDraft({
          bookId: book.id,
        });

        const result = await repository.save({
          entity: bookReadingDraft,
        });

        expect(result).toBeInstanceOf(BookReading);

        expect(result.getId()).toBeDefined();

        expect(result.getBookId()).toEqual(book.id);

        expect(result.getComment()).toEqual(bookReadingDraft.getComment());

        expect(result.getRating()).toEqual(bookReadingDraft.getRating());
      });

      it('updates a BookReading - given a BookReading', async () => {
        const user = await userTestUtils.createAndPersist();

        const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

        const book = await bookTestUtils.createAndPersist({
          input: {
            book: {
              bookshelfId: bookshelf.id,
            },
          },
        });

        const bookReading = bookReadingTestFactory.create({
          bookId: book.id,
        });

        await bookReadingTestUtils.createAndPersist({
          input: {
            ...bookReading.getState(),
          },
        });

        const newComment = Generator.alphaString(20);

        const newRating = Generator.number(5);

        const newStartedAt = Generator.pastDate();

        const newEndedAt = Generator.pastDate();

        bookReading.addUpadateCommentDomainAction({
          comment: newComment,
        });

        bookReading.addUpdateRatingDomainAction({
          rating: newRating,
        });

        bookReading.addUpdateStartedDateDomainAction({
          startedAt: newStartedAt,
        });

        bookReading.addUpdateEndedDateDomainAction({
          endedAt: newEndedAt,
        });

        const result = await repository.save({
          entity: bookReading,
        });

        expect(result).toBeInstanceOf(BookReading);

        const updatedBookReading = await repository.findById({
          id: bookReading.getId(),
        });

        expect(updatedBookReading?.getComment()).toEqual(newComment);

        expect(updatedBookReading?.getRating()).toEqual(newRating);

        expect(updatedBookReading?.getStartedAt()).toEqual(newStartedAt);

        expect(updatedBookReading?.getEndedAt()).toEqual(newEndedAt);
      });
    });

    describe('delete', () => {
      it('deletes a BookReading', async () => {
        const user = await userTestUtils.createAndPersist();

        const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

        const book = await bookTestUtils.createAndPersist({
          input: {
            book: {
              bookshelfId: bookshelf.id,
            },
          },
        });

        const bookReading = await bookReadingTestUtils.createAndPersist({
          input: {
            bookId: book.id,
          },
        });

        const bookReadingEntity = new BookReading({
          id: bookReading.id,
          bookId: book.id,
          comment: bookReading.comment,
          rating: bookReading.rating,
          startedAt: bookReading.startedAt,
          endedAt: bookReading.endedAt,
        });

        await repository.delete({
          entity: bookReadingEntity,
        });

        const result = await repository.findById({
          id: bookReading.id,
        });

        expect(result).toBeNull();
      });
    });
  });
});
