import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BookshelfType } from '@common/contracts';

import { type UpdateUserBookCommandHandler } from './updateUserBookCommandHandler.js';
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
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UpdateUserBookCommandHandlerImpl', () => {
  let commandHandler: UpdateUserBookCommandHandler;

  let bookTestUtils: BookTestUtils;

  let genreTestUtils: GenreTestUtils;

  let collectionTestUtils: CollectionTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let borrowingTestUtils: BorrowingTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateUserBookCommandHandler>(symbols.updateUserBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    borrowingTestUtils = container.get<BorrowingTestUtils>(testSymbols.borrowingTestUtils);

    testUtils = [
      authorTestUtils,
      bookTestUtils,
      collectionTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      userBookTestUtils,
      genreTestUtils,
      borrowingTestUtils,
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

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    try {
      await commandHandler.execute({
        userBookId: nonExistentUserBookId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'UserBook does not exist.',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
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

    try {
      await commandHandler.execute({
        userBookId: userBook.id,
        bookshelfId: invalidBookshelfId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Bookshelf does not exist.',
        id: invalidBookshelfId,
      });

      return;
    }

    expect.fail();
  });

  it('closes a borrowing- when bookshelf is updated from borrowing bookshelf to the standard one', async () => {
    const user = await userTestUtils.createAndPersist();

    const borrowingBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
        type: BookshelfType.borrowing,
      },
    });

    const standardBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
        type: BookshelfType.standard,
      },
    });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: borrowingBookshelf.id,
      },
    });

    const borrowing = await borrowingTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
        startedAt: new Date(),
        endedAt: undefined,
      },
    });

    await commandHandler.execute({
      userBookId: userBook.id,
      bookshelfId: standardBookshelf.id,
    });

    const updatedUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(updatedUserBook?.bookshelfId).toBe(standardBookshelf.id);

    const updatedBorrowing = await borrowingTestUtils.findById({ id: borrowing.id });

    expect(updatedBorrowing?.endedAt).toBeDefined();
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

    const updatedImageUrl = Generator.imageUrl();

    const updatedStatus = Generator.readingStatus();

    const updatedIsFavorite = Generator.boolean();

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userBookId: userBook.id,
      bookshelfId: bookshelf2.id,
      imageUrl: updatedImageUrl,
      status: updatedStatus,
      isFavorite: updatedIsFavorite,
    });

    expect(updatedUserBook.getId()).toBe(userBook.id);

    expect(updatedUserBook.getBookshelfId()).toBe(bookshelf2.id);

    expect(updatedUserBook.getImageUrl()).toBe(updatedImageUrl);

    expect(updatedUserBook.getStatus()).toBe(updatedStatus);

    expect(updatedUserBook.getIsFavorite()).toBe(updatedIsFavorite);
  });

  it('throws an error - when one of the Genres does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const genre1 = await genreTestUtils.createAndPersist();

    const invalidGenreId = Generator.uuid();

    try {
      await commandHandler.execute({
        userBookId: userBook.id,
        genreIds: [genre1.id, invalidGenreId],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Some genres do not exist.',
        ids: [genre1.id, invalidGenreId],
      });

      return;
    }

    expect.fail();
  });

  it('updates UserBook Genres', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const genre1 = await genreTestUtils.createAndPersist();

    const genre2 = await genreTestUtils.createAndPersist();

    const genre3 = await genreTestUtils.createAndPersist();

    const result = await commandHandler.execute({
      userBookId: userBook.id,
      genreIds: [genre1.id, genre2.id, genre3.id],
    });

    result.userBook.getGenres().forEach((genre) => {
      expect(genre.getId()).oneOf([genre1.id, genre2.id, genre3.id]);
    });
  });

  it('throws an error - when one of the Collections does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const collection1 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const invalidCollectionId = Generator.uuid();

    try {
      await commandHandler.execute({
        userBookId: userBook.id,
        collectionIds: [collection1.id, invalidCollectionId],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Some collections do not exist.',
        ids: [collection1.id, invalidCollectionId],
      });

      return;
    }

    expect.fail();
  });

  it('updates UserBook Collections', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const collection1 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const collection2 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const collection3 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

    const result = await commandHandler.execute({
      userBookId: userBook.id,
      collectionIds: [collection1.id, collection2.id, collection3.id],
    });

    result.userBook.getCollections().forEach((collection) => {
      expect(collection.getId()).oneOf([collection1.id, collection2.id, collection3.id]);
    });
  });
});
