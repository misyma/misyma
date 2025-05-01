import { bookshelfTypes } from '@common/contracts';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type BorrowingTestUtils } from '../../../tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

import { type UpdateUserBookCommandHandler } from './updateUserBookCommandHandler.js';

describe('UpdateUserBookCommandHandlerImpl', () => {
  let commandHandler: UpdateUserBookCommandHandler;

  let bookTestUtils: BookTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let collectionTestUtils: CollectionTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let borrowingTestUtils: BorrowingTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateUserBookCommandHandler>(symbols.updateUserBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

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
      categoryTestUtils,
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
    const user = await userTestUtils.createAndPersist();

    const nonExistentUserBookId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: user.id,
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
        user_id: user.id,
      },
    });

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      },
    });

    const invalidBookshelfId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: user.id,
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
        user_id: user.id,
        type: bookshelfTypes.borrowing,
      },
    });

    const standardBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user.id,
        type: bookshelfTypes.standard,
      },
    });

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: borrowingBookshelf.id,
      },
    });

    const borrowing = await borrowingTestUtils.createAndPersist({
      input: {
        user_book_id: userBook.id,
        started_at: new Date(),
        ended_at: undefined,
      },
    });

    await commandHandler.execute({
      userId: user.id,
      userBookId: userBook.id,
      bookshelfId: standardBookshelf.id,
    });

    const updatedUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(updatedUserBook?.bookshelf_id).toBe(standardBookshelf.id);

    const updatedBorrowing = await borrowingTestUtils.findById({ id: borrowing.id });

    expect(updatedBorrowing?.ended_at).toBeDefined();
  });

  it('updates UserBook', async () => {
    const user = await userTestUtils.createAndPersist();

    const author = await authorTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user.id,
      },
    });

    const bookshelf2 = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user.id,
      },
    });

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf1.id,
      },
    });

    const updatedImageUrl = Generator.imageUrl();

    const updatedStatus = Generator.readingStatus();

    const updatedIsFavorite = Generator.boolean();

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userId: user.id,
      userBookId: userBook.id,
      bookshelfId: bookshelf2.id,
      imageUrl: updatedImageUrl,
      status: updatedStatus,
      isFavorite: updatedIsFavorite,
    });

    expect(updatedUserBook.id).toBe(userBook.id);

    expect(updatedUserBook.bookshelfId).toBe(bookshelf2.id);

    expect(updatedUserBook.imageUrl).toBe(updatedImageUrl);

    expect(updatedUserBook.status).toBe(updatedStatus);

    expect(updatedUserBook.isFavorite).toBe(updatedIsFavorite);
  });

  it('throws an error - when one of the Collections does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      },
    });

    const collection1 = await collectionTestUtils.createAndPersist({ input: { user_id: user.id } });

    const invalidCollectionId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: user.id,
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

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      },
    });

    const collection1 = await collectionTestUtils.createAndPersist({ input: { user_id: user.id } });

    const collection2 = await collectionTestUtils.createAndPersist({ input: { user_id: user.id } });

    const collection3 = await collectionTestUtils.createAndPersist({ input: { user_id: user.id } });

    const result = await commandHandler.execute({
      userId: user.id,
      userBookId: userBook.id,
      collectionIds: [collection1.id, collection2.id, collection3.id],
    });

    result.userBook.collections?.forEach((collection) => {
      expect(collection.getId()).oneOf([collection1.id, collection2.id, collection3.id]);
    });
  });

  it('throws an error - when User does not own this UserBook', async () => {
    const user1 = await userTestUtils.createAndPersist();

    const user2 = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: user1.id } });

    const author = await authorTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          category_id: category.id,
        },
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      },
    });

    try {
      await commandHandler.execute({
        userId: user2.id,
        userBookId: userBook.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User does not own this UserBook.',
        userId: user2.id,
        userBookId: userBook.id,
      });

      return;
    }

    expect.fail();
  });
});
