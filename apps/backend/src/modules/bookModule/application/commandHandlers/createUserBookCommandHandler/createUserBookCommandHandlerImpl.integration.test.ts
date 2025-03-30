import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

import { type CreateUserBookCommandHandler } from './createUserBookCommandHandler.js';

describe('CreateUserBookCommandHandler', () => {
  let createUserBookCommandHandler: CreateUserBookCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let genreTestUtils: GenreTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    createUserBookCommandHandler = container.get<CreateUserBookCommandHandler>(symbols.createUserBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [genreTestUtils, authorTestUtils, bookTestUtils, bookshelfTestUtils, userTestUtils, userBookTestUtils];

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

  it('creates UserBook', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const isFavorite = Generator.boolean();

    const { userBook } = await createUserBookCommandHandler.execute({
      userId: user.id,
      imageUrl,
      status,
      isFavorite,
      bookshelfId: bookshelf.id,
      bookId: book.id,
    });

    const foundUserBook = await userBookTestUtils.findById({
      id: userBook.getId(),
    });

    expect(foundUserBook?.bookId).toEqual(book.id);

    expect(foundUserBook?.bookshelfId).toEqual(bookshelf.id);

    expect(foundUserBook?.status).toEqual(status);

    expect(foundUserBook?.imageUrl).toEqual(imageUrl);

    expect(foundUserBook?.isFavorite).toEqual(isFavorite);
  });

  it('throws an error - when provided Bookshelf does not exist', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const userId = Generator.uuid();

    const bookshelfId = Generator.uuid();

    const isFavorite = Generator.boolean();

    try {
      await createUserBookCommandHandler.execute({
        userId,
        imageUrl,
        status,
        isFavorite,
        bookshelfId,
        bookId: book.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when provided Book does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const bookId = Generator.uuid();

    const isFavorite = Generator.boolean();

    try {
      await createUserBookCommandHandler.execute({
        userId: user.id,
        imageUrl,
        status,
        isFavorite,
        bookshelfId: bookshelf.id,
        bookId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Book does not exist.',
        id: bookId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when UserBook already exists on same bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const isFavorite = Generator.boolean();

    await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    try {
      await createUserBookCommandHandler.execute({
        userId: user.id,
        imageUrl,
        status,
        isFavorite,
        bookshelfId: bookshelf.id,
        bookId: book.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toMatchObject({
        resource: 'UserBook',
        bookshelfId: bookshelf.id,
        bookId: book.id,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Bookshelf does not belong to the User', async () => {
    const user1 = await userTestUtils.createAndPersist();

    const user2 = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user1.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const isFavorite = Generator.boolean();

    try {
      await createUserBookCommandHandler.execute({
        userId: user2.id,
        imageUrl,
        status,
        isFavorite,
        bookshelfId: bookshelf.id,
        bookId: book.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Bookshelf does not belong to the user.',
        userId: user2.id,
        bookshelfId: bookshelf.id,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when User already have that book on some bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const status = Generator.readingStatus();

    const imageUrl = Generator.imageUrl();

    const isFavorite = Generator.boolean();

    await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf1.id,
      },
    });

    try {
      await createUserBookCommandHandler.execute({
        userId: user.id,
        imageUrl,
        status,
        isFavorite,
        bookshelfId: bookshelf2.id,
        bookId: book.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toMatchObject({
        resource: 'UserBook',
        bookshelfId: bookshelf2.id,
        bookId: book.id,
      });

      return;
    }

    expect.fail();
  });
});
