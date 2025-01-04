import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type DeleteBookshelfCommandHandler } from './deleteBookshelfCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../../bookModule/tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('DeleteBookshelfCommandHandlerImpl', () => {
  let commandHandler: DeleteBookshelfCommandHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let bookTestUtils: BookTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteBookshelfCommandHandler>(symbols.deleteBookshelfCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    testUtils = [genreTestUtils, bookTestUtils, bookshelfTestUtils, userTestUtils, userBookTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    const userId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookshelfId: nonExistentBookshelfId,
        userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'Bookshelf',
        bookshelfId: nonExistentBookshelfId,
        userId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when User does not have permission to delete this Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const anotherUser = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: anotherUser.id,
      },
    });

    try {
      await commandHandler.execute({
        bookshelfId: bookshelf.id,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User does not have permission to delete this bookshelf.',
        bookshelfId: bookshelf.id,
        userId: user.id,
      });

      return;
    }

    expect.fail();
  });

  it('deletes a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    await commandHandler.execute({
      bookshelfId: bookshelf.id,
      userId: user.id,
    });

    const foundBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.id,
    });

    expect(foundBookshelf).toBeNull();
  });

  it('deletes a Bookshelf and moves UserBooks to another Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const bookshelf2 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const genre = await genreTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf1.id,
        genreId: genre.id,
      },
    });

    await commandHandler.execute({
      userId: user.id,
      bookshelfId: bookshelf1.id,
      fallbackBookshelfId: bookshelf2.id,
    });

    const updatedUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(updatedUserBook?.bookshelfId).toBe(bookshelf2.id);

    const foundBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf1.id,
    });

    expect(foundBookshelf).toBeNull();
  });
});
