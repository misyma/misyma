import { describe, expect, it } from 'vitest';

import { BookFormat, BookStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';

describe('Book', () => {
  const bookTestFactory = new BookTestFactory();

  describe('addAddAuthorDomainAction', () => {
    it('throws an error - when Author is already assigned', async () => {
      const book = bookTestFactory.create();

      const author = new Author({
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      book.addAddAuthorDomainAction(author);

      await expect(() => book.addAddAuthorDomainAction(author)).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: author.getId(),
        },
      });
    });

    it('adds a AddAuthorDomainAction', () => {
      const book = bookTestFactory.create();

      const author = new Author({
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      book.addAddAuthorDomainAction(author);

      expect(book.getDomainActions()).toEqual([
        {
          type: 'addAuthor',
          payload: {
            authorId: author.getId(),
          },
        },
      ]);
    });
  });

  describe('addDeleteAuthorDomainAction', () => {
    it('throws an error - when Author is not assigned', async () => {
      const book = bookTestFactory.create();

      const author = new Author({
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      await expect(() => book.addDeleteAuthorDomainAction(author)).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: author.getId(),
        },
      });
    });

    it('adds a DeleteAuthorDomainAction', () => {
      const book = bookTestFactory.create();

      const author = new Author({
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      book.addAddAuthorDomainAction(author);

      book.addDeleteAuthorDomainAction(author);

      expect(book.getDomainActions()).toEqual([
        {
          type: 'addAuthor',
          payload: {
            authorId: author.getId(),
          },
        },
        {
          type: 'deleteAuthor',
          payload: {
            authorId: author.getId(),
          },
        },
      ]);
    });
  });

  describe('addUpdateTitleDomainAction', () => {
    it('throws an error - given an identical title', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateTitleDomainAction({
          title: book.getTitle(),
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getTitle(),
        },
      });
    });

    it('adds a UpdateTitleDomainAction', () => {
      const book = bookTestFactory.create();

      const title = 'updatedTitle';

      book.addUpdateTitleDomainAction({
        title,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateTitle',
          payload: {
            title,
          },
        },
      ]);
    });
  });

  describe('addUpdateIsbnDomainAction', () => {
    it('throws an error - given an identical isbn', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateIsbnDomainAction({
          isbn: book.getIsbn() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getIsbn(),
        },
      });
    });

    it('adds a UpdateIsbnDomainAction', () => {
      const book = bookTestFactory.create();

      const isbn = 'updatedIsbn';

      book.addUpdateIsbnDomainAction({
        isbn,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateIsbn',
          payload: {
            isbn,
          },
        },
      ]);
    });
  });

  describe('addUpdatePublisherDomainAction', () => {
    it('throws an error - given an identical publisher', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdatePublisherDomainAction({
          publisher: book.getPublisher() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getPublisher(),
        },
      });
    });

    it('adds a UpdatePublisherDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedPublisher = 'updatedPublisher';

      book.addUpdatePublisherDomainAction({
        publisher: updatedPublisher,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updatePublisher',
          payload: {
            publisher: updatedPublisher,
          },
        },
      ]);
    });
  });

  describe('AddUpdateReleaseYearDomainAction', () => {
    it('throws an error - given an identical releaseYear', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateReleaseYearDomainAction({
          releaseYear: book.getReleaseYear() as number,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getReleaseYear(),
        },
      });
    });

    it('adds a UpdateReleaseYearDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedRelaseYear = (book.getReleaseYear() as number) + 1;

      book.addUpdateReleaseYearDomainAction({
        releaseYear: updatedRelaseYear,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateReleaseYear',
          payload: {
            releaseYear: updatedRelaseYear,
          },
        },
      ]);
    });
  });

  describe('AddUpdateLanguageDomainAction', () => {
    it('throws an error - given an identical language', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateLanguageDomainAction({
          language: book.getLanguage() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getLanguage(),
        },
      });
    });

    it('adds a UpdateLanguageDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedLanguage = 'updatedLanguage';

      book.addUpdateLanguageDomainAction({
        language: updatedLanguage,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateLanguage',
          payload: {
            language: updatedLanguage,
          },
        },
      ]);
    });
  });

  describe('AddUpdateTranslatorDomainAction', () => {
    it('throws an error - given an identical translator', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateTranslatorDomainAction({
          translator: book.getTranslator() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getTranslator(),
        },
      });
    });

    it('adds a UpdateTranslatorDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedTranslator = 'updatedTranslator';

      book.addUpdateTranslatorDomainAction({
        translator: updatedTranslator,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateTranslator',
          payload: {
            translator: updatedTranslator,
          },
        },
      ]);
    });
  });

  describe('addUpdateFormatDomainAction', () => {
    it('throws an error - given an identical format', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateFormatDomainAction({
          format: book.getFormat(),
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getFormat(),
        },
      });
    });

    it('adds a UpdateFormatDomainAction', () => {
      const book = bookTestFactory.create({ format: BookFormat.hardcover });

      const updatedFormat = BookFormat.paperback;

      book.addUpdateFormatDomainAction({
        format: updatedFormat,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateFormat',
          payload: {
            format: updatedFormat,
          },
        },
      ]);
    });
  });

  describe('addUpdatePagesDomainAction', () => {
    it('throws an error - given an identical pages', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdatePagesDomainAction({
          pages: book.getPages() as number,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getPages(),
        },
      });
    });

    it('adds a UpdatePagesDomainAction', () => {
      const book = bookTestFactory.create();

      const pages = (book.getPages() as number) + 1;

      book.addUpdatePagesDomainAction({
        pages,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updatePages',
          payload: {
            pages,
          },
        },
      ]);
    });
  });

  describe('addUpdateFrontCoverImageUrlDomainAction', () => {
    it('throws an error - given an identical frontCoverImageUrl', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateFrontCoverImageUrlDomainAction({
          frontCoverImageUrl: book.getFrontCoverImageUrl() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getFrontCoverImageUrl(),
        },
      });
    });

    it('adds a UpdateFrontCoverImageUrlDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedFrontCoverImageUrl = 'updatedFrontCoverImageUrl';

      book.addUpdateFrontCoverImageUrlDomainAction({
        frontCoverImageUrl: updatedFrontCoverImageUrl,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateFrontCoverImageUrl',
          payload: {
            frontCoverImageUrl: updatedFrontCoverImageUrl,
          },
        },
      ]);
    });
  });

  describe('addUpdateBackCoverImageUrlDomainAction', () => {
    it('throws an error - given an identical backCoverImageUrl', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateBackCoverImageUrlDomainAction({
          backCoverImageUrl: book.getBackCoverImageUrl() as string,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getBackCoverImageUrl(),
        },
      });
    });

    it('adds a UpdateBackCoverImageUrlDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedBackCoverImageUrl = 'updatedBackCoverImageUrl';

      book.addUpdateBackCoverImageUrlDomainAction({
        backCoverImageUrl: updatedBackCoverImageUrl,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateBackCoverImageUrl',
          payload: {
            backCoverImageUrl: updatedBackCoverImageUrl,
          },
        },
      ]);
    });
  });

  describe('addUpdateStatusDomainAction', () => {
    it('throws an error - given an identical status', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateStatusDomainAction({
          status: book.getStatus(),
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getStatus(),
        },
      });
    });

    it('adds a UpdateStatusDomainAction', () => {
      const book = bookTestFactory.create({ status: BookStatus.readingInProgress });

      const updatedStatus = BookStatus.finishedReading;

      book.addUpdateStatusDomainAction({
        status: updatedStatus,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateStatus',
          payload: {
            status: updatedStatus,
          },
        },
      ]);
    });
  });

  describe('addUpdateBookshelfDomainAction', () => {
    it('throws an error - given an identical bookshelfId', async () => {
      const book = bookTestFactory.create();

      await expect(() =>
        book.addUpdateBookshelfDomainAction({
          bookshelfId: book.getBookshelfId(),
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: book.getBookshelfId(),
        },
      });
    });

    it('adds a UpdateBookshelfDomainAction', () => {
      const book = bookTestFactory.create();

      const updatedBookshelfId = Generator.uuid();

      book.addUpdateBookshelfDomainAction({
        bookshelfId: updatedBookshelfId,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'updateBookshelf',
          payload: {
            bookshelfId: updatedBookshelfId,
          },
        },
      ]);
    });
  });
});
