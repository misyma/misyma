import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateUserBooksCommandHandler } from './updateUserBooksCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UpdateUserBooksCommandHandlerImpl', () => {
  let commandHandler: UpdateUserBooksCommandHandler;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateUserBooksCommandHandler>(symbols.updateUserBooksCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [authorTestUtils, bookTestUtils, bookshelfTestUtils, userTestUtils, userBookTestUtils];

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

  it('throws an error - when some of the UserBooks do not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const nonExistentUserBookId = Generator.uuid();

    await expect(async () =>
      commandHandler.execute({
        data: [
          {
            userBookId: nonExistentUserBookId,
            bookshelfId: bookshelf1.id,
          },
        ],
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('throws an error - when some of the Bookshelves do not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBooks = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const invalidBookshelfId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          data: [
            {
              userBookId: userBooks.id,
              bookshelfId: invalidBookshelfId,
            },
          ],
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('updates UserBooks', async () => {
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

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf1.id,
      },
    });

    await commandHandler.execute({
      data: [
        {
          userBookId: userBook.id,
          bookshelfId: bookshelf2.id,
        },
      ],
    });

    const updatedUserBook = await userBookTestUtils.findById({
      id: userBook.id,
    });

    expect(updatedUserBook?.bookshelfId).toBe(bookshelf2.id);
  });
});
