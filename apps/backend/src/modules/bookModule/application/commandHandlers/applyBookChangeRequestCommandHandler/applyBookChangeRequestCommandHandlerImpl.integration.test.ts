import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type ApplyBookChangeRequestCommandHandler } from './applyBookChangeRequestCommandHandler.js';

describe('ApplyBookChangeRequestCommandHandlerImpl', () => {
  let commandHandler: ApplyBookChangeRequestCommandHandler;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<ApplyBookChangeRequestCommandHandler>(symbols.applyBookChangeRequestCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils, categoryTestUtils];

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

  it('throws an error - when BookChangeRequest does not exist', async () => {
    const nonExistentBookChangeRequestId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookChangeRequestId: nonExistentBookChangeRequestId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('applies a BookChangeRequest to the Book', async () => {
    const user = await userTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          categoryId: category.id,
        },
      },
    });

    const author = await authorTestUtils.createAndPersist();

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        userEmail: user.email,
        authorIds: author.id,
      },
    });

    await commandHandler.execute({ bookChangeRequestId: bookChangeRequest.id });

    const updatedBook = await bookTestUtils.findById({ id: book.id });

    expect(updatedBook).toEqual({
      id: book.id,
      categoryId: category.id,
      title: bookChangeRequest.title,
      publisher: bookChangeRequest.publisher,
      releaseYear: bookChangeRequest.releaseYear,
      isbn: bookChangeRequest.isbn,
      language: bookChangeRequest.language,
      translator: bookChangeRequest.translator,
      format: bookChangeRequest.format,
      pages: bookChangeRequest.pages,
      imageUrl: bookChangeRequest.imageUrl,
      isApproved: book.isApproved,
      createdAt: book.createdAt,
    });

    const bookAuthors = await bookTestUtils.findBookAuthors({ bookId: book.id });

    expect(bookAuthors).toEqual([
      {
        authorId: author.id,
        bookId: book.id,
      },
    ]);

    const bookChangeRequestAfter = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.id });

    expect(bookChangeRequestAfter).toBeNull();
  });

  it('throws an error - when some of the authors do not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          categoryId: category.id,
        },
      },
    });

    const authorIds = [Generator.uuid(), Generator.uuid()];

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        userEmail: user.email,
        authorIds: authorIds.join(','),
      },
    });

    try {
      await commandHandler.execute({ bookChangeRequestId: bookChangeRequest.id });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });
});
