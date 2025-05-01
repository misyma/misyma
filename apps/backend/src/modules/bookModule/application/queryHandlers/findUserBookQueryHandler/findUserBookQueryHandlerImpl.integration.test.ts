import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

import { type FindUserBookQueryHandler } from './findUserBookQueryHandler.js';

describe('FindUserBookQueryHandler', () => {
  let findUserBookQueryHandler: FindUserBookQueryHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    findUserBookQueryHandler = container.get<FindUserBookQueryHandler>(symbols.findUserBookQueryHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    testUtils = [
      categoryTestUtils,
      authorTestUtils,
      bookTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      userBookTestUtils,
    ];

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

  it('finds UserBook by id', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          categoryId: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const { userBook: foundUserBook } = await findUserBookQueryHandler.execute({
      userId: user.id,
      userBookId: userBook.id,
    });

    expect(foundUserBook).not.toBeNull();
  });

  it('throws an error if UserBook with given id does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const id = Generator.uuid();

    try {
      await findUserBookQueryHandler.execute({
        userId: user.id,
        userBookId: id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error if UserBook does not belong to User', async () => {
    const user = await userTestUtils.createAndPersist();

    const anotherUser = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: anotherUser.id } });

    const author = await authorTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          categoryId: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    try {
      await findUserBookQueryHandler.execute({
        userId: user.id,
        userBookId: userBook.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });
});
