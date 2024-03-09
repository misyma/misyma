import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DummyFactory, Generator, SpyFactory } from '@common/tests';

import { FindBooksQueryHandlerImpl } from './findBooksQueryHandlerImpl.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { BookshelfTestFactory } from '../../../../bookshelfModule/tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

describe('FindBooksQueryHandlerImpl', () => {
  const spyFactory = new SpyFactory(vi);

  const bookshelfTestFactory = BookshelfTestFactory.createFactory();

  let bookRepositoryMock: BookRepository;

  let bookshelfRepositoryMock: BookshelfRepository;

  let findBooksQueryHandlerImpl: FindBooksQueryHandlerImpl;

  beforeEach(() => {
    bookRepositoryMock = new DummyFactory().create();

    bookshelfRepositoryMock = new DummyFactory().create();

    findBooksQueryHandlerImpl = new FindBooksQueryHandlerImpl(bookRepositoryMock, bookshelfRepositoryMock);
  });

  it('throws an error - given Bookshelf does not exist', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    spyFactory.create(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(null);

    expect(
      async () =>
        await findBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: nonExistentBookshelfId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Bookshelf',
        id: nonExistentBookshelfId,
      },
    });
  });

  it('throws an error - given Bookshelf does not belong to user', async () => {
    const bookshelf = bookshelfTestFactory.create();

    const nonMatchingUserId = Generator.uuid();

    spyFactory.create(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    expect(
      async () =>
        await findBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: bookshelf.getId(),
          userId: nonMatchingUserId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Bookshelf',
        id: bookshelf.getId(),
      },
    });
  });
});
