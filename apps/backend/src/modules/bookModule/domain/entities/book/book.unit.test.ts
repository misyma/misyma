import { describe, expect, it } from 'vitest';

import { Book } from './book.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';

describe('Book', () => {
  describe('addAddAuthorDomainAction', () => {
    it('throws an error - when Author is already assigned', async () => {
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

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
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

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
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

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
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

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

  describe('addChangeTitleDomainAction', () => {
    it('throws an error - given an identical title', async () => {
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

      await expect(() =>
        book.addChangeTitleDomainAction({
          title: 'title',
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: 'title',
        },
      });
    });

    it('adds a ChangeTitleDomainAction', () => {
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

      book.addChangeTitleDomainAction({
        title: 'new title',
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'changeTitle',
          payload: {
            title: 'new title',
          },
        },
      ]);
    });
  });

  describe('AddChangeReleaseYearDomainAction', () => {
    it('throws an error - given an identical releaseYear', async () => {
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

      await expect(() =>
        book.addChangeReleaseYearDomainAction({
          releaseYear: 2020,
        }),
      ).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          value: 2020,
        },
      });
    });

    it('adds a ChangeReleaseYearDomainAction', () => {
      const book = new Book({
        id: '1',
        title: 'title',
        releaseYear: 2020,
      });

      book.addChangeReleaseYearDomainAction({
        releaseYear: 2021,
      });

      expect(book.getDomainActions()).toEqual([
        {
          type: 'changeReleaseYear',
          payload: {
            releaseYear: 2021,
          },
        },
      ]);
    });
  });
});
