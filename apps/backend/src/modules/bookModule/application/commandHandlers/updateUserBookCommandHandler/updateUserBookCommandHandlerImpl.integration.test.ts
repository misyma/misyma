import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type ReadingStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { type UpdateUserBookCommandHandler } from './updateUserBookCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UpdateUserBookCommandHandlerImpl', () => {
  let commandHandler: UpdateUserBookCommandHandler;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let databaseClient: DatabaseClient;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateUserBookCommandHandler>(symbols.updateUserBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await userBookTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    await expect(async () =>
      commandHandler.execute({
        userBookId: nonExistentUserBookId,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('throws an error - when updated Bookshelf does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const invalidBookshelfId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          userBookId: userBook.id,
          bookshelfId: invalidBookshelfId,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('updates UserBook', async () => {
    const user = await userTestUtils.createAndPersist();

    const author = await authorTestUtils.createAndPersist();

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

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf1.id,
      },
    });

    const updatedImageUrl = Generator.url();

    const updatedStatus = Generator.bookReadingStatus() as ReadingStatus;

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userBookId: userBook.id,
      bookshelfId: bookshelf2.id,
      imageUrl: updatedImageUrl,
      status: updatedStatus,
    });

    expect(updatedUserBook.getId()).toBe(userBook.id);

    expect(updatedUserBook.getBookshelfId()).toBe(bookshelf2.id);

    expect(updatedUserBook.getImageUrl()).toBe(updatedImageUrl);

    expect(updatedUserBook.getStatus()).toBe(updatedStatus);
  });
});
