import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FindUserBooksQueryHandlerImpl } from './findUserBooksQueryHandlerImpl.js';
import { DummyFactory } from '../../../../../../tests/dummyFactory.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { BookshelfTestFactory } from '../../../../bookshelfModule/tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

describe('FindUserBooksQueryHandlerImpl', () => {
  const bookshelfTestFactory = new BookshelfTestFactory();

  let userBookRepositoryMock: UserBookRepository;

  let bookshelfRepositoryMock: BookshelfRepository;

  let findUserBooksQueryHandlerImpl: FindUserBooksQueryHandlerImpl;

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(() => {
    userBookRepositoryMock = DummyFactory.create();

    userBookRepositoryMock.findUserBooks = vi.fn();

    userBookRepositoryMock.countUserBooks = vi.fn();

    bookshelfRepositoryMock = DummyFactory.create();

    bookshelfRepositoryMock.findBookshelf = vi.fn();

    findUserBooksQueryHandlerImpl = new FindUserBooksQueryHandlerImpl(userBookRepositoryMock, bookshelfRepositoryMock);
  });

  it('throws an error - given Bookshelf does not exist', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(null);

    expect(
      async () =>
        await findUserBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: nonExistentBookshelfId,
          page: 1,
          pageSize: 10,
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

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    expect(
      async () =>
        await findUserBooksQueryHandlerImpl.execute({
          ids: [],
          bookshelfId: bookshelf.getId(),
          userId: nonMatchingUserId,
          page: 1,
          pageSize: 10,
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

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    vi.spyOn(userBookRepositoryMock, 'findUserBooks').mockResolvedValueOnce([userBook]);

    vi.spyOn(userBookRepositoryMock, 'countUserBooks').mockResolvedValueOnce(1);

    const { userBooks, total } = await findUserBooksQueryHandlerImpl.execute({
      ids: [],
      bookshelfId: bookshelf.getId(),
      page: 1,
      pageSize: 10,
    });

    expect(userBooks).toEqual([userBook]);

    expect(total).toEqual(1);
  });
});
