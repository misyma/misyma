import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type ReadingStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { type CreateUserBookCommandHandler } from './createUserBookCommandHandler.js';
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

describe('CreateUserBookCommandHandler', () => {
  let createUserBookCommandHandler: CreateUserBookCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    createUserBookCommandHandler = container.get<CreateUserBookCommandHandler>(symbols.createUserBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

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

  it('creates UserBook', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.bookReadingStatus() as ReadingStatus;

    const imageUrl = Generator.imageUrl();

    const { userBook } = await createUserBookCommandHandler.execute({
      imageUrl,
      status,
      bookshelfId: bookshelf.id,
      bookId: book.id,
    });

    const foundUserBook = await userBookTestUtils.findById({
      id: userBook.getId(),
    });

    expect(foundUserBook.bookId).toEqual(book.id);

    expect(foundUserBook.bookshelfId).toEqual(bookshelf.id);

    expect(foundUserBook.status).toEqual(status);

    expect(foundUserBook.imageUrl).toEqual(imageUrl);
  });

  it('throws an error - when provided Bookshelf does not exist', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.bookReadingStatus() as ReadingStatus;

    const imageUrl = Generator.imageUrl();

    const bookshelfId = Generator.uuid();

    await expect(async () =>
      createUserBookCommandHandler.execute({
        imageUrl,
        status,
        bookshelfId,
        bookId: book.id,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      },
    });
  });

  it('throws an error - when provided Book does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const status = Generator.bookReadingStatus() as ReadingStatus;

    const imageUrl = Generator.imageUrl();

    const bookId = Generator.uuid();

    await expect(async () =>
      createUserBookCommandHandler.execute({
        imageUrl,
        status,
        bookshelfId: bookshelf.id,
        bookId,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Book does not exist.',
        id: bookId,
      },
    });
  });
});
