import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FindUserBooksQueryHandlerImpl } from './findUserBooksQueryHandlerImpl.js';
import { DummyFactory } from '../../../../../../tests/dummyFactory.js';
import { Generator } from '../../../../../../tests/generator.js';
import { SpyFactory } from '../../../../../../tests/spyFactory.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { BookshelfTestFactory } from '../../../../bookshelfModule/tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

describe('FindUserBooksQueryHandlerImpl', () => {
  const spyFactory = new SpyFactory(vi);

  const bookshelfTestFactory = new BookshelfTestFactory();

  let userBookRepositoryMock: UserBookRepository;

  let bookshelfRepositoryMock: BookshelfRepository;

  let findUserBooksQueryHandlerImpl: FindUserBooksQueryHandlerImpl;

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(() => {
    userBookRepositoryMock = new DummyFactory().create();

    bookshelfRepositoryMock = new DummyFactory().create();

    findUserBooksQueryHandlerImpl = new FindUserBooksQueryHandlerImpl(userBookRepositoryMock, bookshelfRepositoryMock);
  });

  it('throws an error - given Bookshelf does not exist', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    spyFactory.create(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(null);

    expect(
      async () =>
        await findUserBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: nonExistentBookshelfId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Bookshelf',
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
        await findUserBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: bookshelf.getId(),
          userId: nonMatchingUserId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Bookshelf',
        id: bookshelf.getId(),
      },
    });
  });

  it('finds UserBooks', async () => {
    const bookshelf = bookshelfTestFactory.create();

    const userBook = userBookTestFactory.create();

    spyFactory.create(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    spyFactory.create(userBookRepositoryMock, 'findUserBooks').mockResolvedValueOnce([userBook]);

    const { userBooks } = await findUserBooksQueryHandlerImpl.execute({
      ids: [],
      bookshelfId: bookshelf.getId(),
    });

    expect(userBooks).toEqual([userBook]);
  });
});
