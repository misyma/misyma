import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FindUserBooksQueryHandlerImpl } from './findUserBooksQueryHandlerImpl.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { BookshelfTestFactory } from '../../../../bookshelfModule/tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { CollectionTestFactory } from '../../../tests/factories/collectionTestFactory/collectionTestFactory.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

describe('FindUserBooksQueryHandlerImpl', () => {
  const bookshelfTestFactory = new BookshelfTestFactory();

  const userBookTestFactory = new UserBookTestFactory();

  const collectionTestFactory = new CollectionTestFactory();

  let userBookRepositoryMock: UserBookRepository;

  let bookshelfRepositoryMock: BookshelfRepository;

  let collectionRepositoryMock: CollectionRepository;

  let findUserBooksQueryHandlerImpl: FindUserBooksQueryHandlerImpl;

  beforeEach(() => {
    userBookRepositoryMock = {
      findUserBooks: vi.fn(),
      countUserBooks: vi.fn(),
    } as never;

    bookshelfRepositoryMock = {
      findBookshelf: vi.fn(),
    } as never;

    collectionRepositoryMock = {
      findCollection: vi.fn(),
    } as never;

    findUserBooksQueryHandlerImpl = new FindUserBooksQueryHandlerImpl(
      userBookRepositoryMock,
      bookshelfRepositoryMock,
      collectionRepositoryMock,
    );
  });

  it('throws an error - given Bookshelf does not exist', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(null);

    try {
      await findUserBooksQueryHandlerImpl.execute({
        userId: Generator.uuid(),
        bookshelfId: nonExistentBookshelfId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Bookshelf',
        id: nonExistentBookshelfId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - given Bookshelf does not belong to user', async () => {
    const bookshelf = bookshelfTestFactory.create();

    const nonMatchingUserId = Generator.uuid();

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    try {
      await findUserBooksQueryHandlerImpl.execute({
        bookshelfId: bookshelf.getId(),
        userId: nonMatchingUserId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Bookshelf',
        id: bookshelf.getId(),
      });

      return;
    }

    expect.fail();
  });

  it('finds UserBooks by Bookshelf', async () => {
    const bookshelf = bookshelfTestFactory.create();

    const userBook = userBookTestFactory.create();

    vi.spyOn(bookshelfRepositoryMock, 'findBookshelf').mockResolvedValueOnce(bookshelf);

    vi.spyOn(userBookRepositoryMock, 'findUserBooks').mockResolvedValueOnce([userBook]);

    vi.spyOn(userBookRepositoryMock, 'countUserBooks').mockResolvedValueOnce(1);

    const { userBooks, total } = await findUserBooksQueryHandlerImpl.execute({
      userId: bookshelf.getUserId(),
      bookshelfId: bookshelf.getId(),
      page: 1,
      pageSize: 10,
    });

    expect(userBooks).toEqual([userBook]);

    expect(total).toEqual(1);
  });

  it('finds UserBooks by Collection', async () => {
    const collection = collectionTestFactory.create();

    const userBook = userBookTestFactory.create();

    vi.spyOn(collectionRepositoryMock, 'findCollection').mockResolvedValueOnce(collection);

    vi.spyOn(userBookRepositoryMock, 'findUserBooks').mockResolvedValueOnce([userBook]);

    vi.spyOn(userBookRepositoryMock, 'countUserBooks').mockResolvedValueOnce(1);

    const { userBooks, total } = await findUserBooksQueryHandlerImpl.execute({
      collectionId: collection.getId(),
      userId: collection.getUserId(),
      page: 1,
      pageSize: 10,
    });

    expect(userBooks).toEqual([userBook]);

    expect(total).toEqual(1);
  });

  it('throws an error - given Collection does not exist', async () => {
    const nonExistentCollectionId = Generator.uuid();

    vi.spyOn(collectionRepositoryMock, 'findCollection').mockResolvedValueOnce(null);

    try {
      await findUserBooksQueryHandlerImpl.execute({
        userId: Generator.uuid(),
        collectionId: nonExistentCollectionId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Collection',
        id: nonExistentCollectionId,
      });

      return;
    }

    expect.fail();
  });
});
