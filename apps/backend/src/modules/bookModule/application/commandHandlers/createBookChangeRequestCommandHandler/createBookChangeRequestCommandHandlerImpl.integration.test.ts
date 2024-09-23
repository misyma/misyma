import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateBookChangeRequestCommandHandler } from './createBookChangeRequestCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookChangeRequestTestFactory } from '../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookChangeRequestCommandHandler', () => {
  let createBookChangeRequestCommandHandler: CreateBookChangeRequestCommandHandler;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  const bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    createBookChangeRequestCommandHandler = container.get<CreateBookChangeRequestCommandHandler>(
      symbols.createBookChangeRequestCommandHandler,
    );

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils];

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

  it('creates a BookChangeRequest', async () => {
    const user = await userTestUtils.createAndPersist();

    const author1 = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({ input: { authorIds: [author1.id] } });

    const author2 = await authorTestUtils.createAndPersist();

    const createdBookChangeRequest = bookChangeRequestTestFactory.create();

    const { bookChangeRequest } = await createBookChangeRequestCommandHandler.execute({
      title: createdBookChangeRequest.getTitle(),
      isbn: createdBookChangeRequest.getIsbn() as string,
      publisher: createdBookChangeRequest.getPublisher() as string,
      releaseYear: createdBookChangeRequest.getReleaseYear() as number,
      language: createdBookChangeRequest.getLanguage(),
      translator: createdBookChangeRequest.getTranslator() as string,
      format: createdBookChangeRequest.getFormat(),
      pages: createdBookChangeRequest.getPages() as number,
      imageUrl: createdBookChangeRequest.getImageUrl() as string,
      authorIds: [author2.id],
      bookId: book.id,
      userId: user.id,
    });

    expect(bookChangeRequest.getState()).toEqual({
      bookId: book.id,
      userEmail: user.email,
      createdAt: expect.any(Date),
      format: createdBookChangeRequest.getFormat(),
      title: createdBookChangeRequest.getTitle(),
      isbn: createdBookChangeRequest.getIsbn(),
      publisher: createdBookChangeRequest.getPublisher(),
      releaseYear: createdBookChangeRequest.getReleaseYear(),
      language: createdBookChangeRequest.getLanguage(),
      translator: createdBookChangeRequest.getTranslator(),
      pages: createdBookChangeRequest.getPages(),
      imageUrl: createdBookChangeRequest.getImageUrl(),
      authorIds: [author2.id],
      book: {
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        publisher: book.publisher,
        releaseYear: book.releaseYear,
        language: book.language,
        translator: book.translator,
        format: book.format,
        pages: book.pages,
        imageUrl: book.imageUrl,
        createdAt: book.createdAt,
        isApproved: book.isApproved,
        authors: [
          {
            id: author1.id,
            state: {
              name: author1.name,
              createdAt: author1.createdAt,
              isApproved: author1.isApproved,
            },
          },
        ],
      },
    });

    const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.getId() });

    expect(foundBookChangeRequest).toEqual({
      id: bookChangeRequest.getId(),
      bookId: book.id,
      userEmail: user.email,
      createdAt: expect.any(Date),
      format: createdBookChangeRequest.getFormat(),
      title: createdBookChangeRequest.getTitle(),
      isbn: createdBookChangeRequest.getIsbn(),
      publisher: createdBookChangeRequest.getPublisher(),
      releaseYear: createdBookChangeRequest.getReleaseYear(),
      language: createdBookChangeRequest.getLanguage(),
      translator: createdBookChangeRequest.getTranslator(),
      pages: createdBookChangeRequest.getPages(),
      imageUrl: createdBookChangeRequest.getImageUrl(),
      authorIds: author2.id,
    });
  });

  it('throws an error - when some of the authors do not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist();

    const authorIds = [Generator.uuid(), Generator.uuid()];

    try {
      await createBookChangeRequestCommandHandler.execute({
        authorIds,
        bookId: book.id,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Some authors do not exist.',
        authorIds,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when provided User does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookId = Generator.uuid();

    const createdBookChangeRequest = bookChangeRequestTestFactory.create();

    try {
      await createBookChangeRequestCommandHandler.execute({
        title: createdBookChangeRequest.getTitle(),
        isbn: createdBookChangeRequest.getIsbn() as string,
        publisher: createdBookChangeRequest.getPublisher() as string,
        releaseYear: createdBookChangeRequest.getReleaseYear() as number,
        language: createdBookChangeRequest.getLanguage(),
        translator: createdBookChangeRequest.getTranslator() as string,
        format: createdBookChangeRequest.getFormat(),
        pages: createdBookChangeRequest.getPages() as number,
        imageUrl: createdBookChangeRequest.getImageUrl() as string,
        bookId,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Book does not exist.',
        id: bookId,
      });

      return;
    }
  });

  it('throws an error - when provided Book does not exist', async () => {
    const userId = Generator.uuid();

    const book = await bookTestUtils.createAndPersist();

    const createdBookChangeRequest = bookChangeRequestTestFactory.create({
      bookId: book.id,
    });

    try {
      await createBookChangeRequestCommandHandler.execute({
        title: createdBookChangeRequest.getTitle(),
        isbn: createdBookChangeRequest.getIsbn() as string,
        publisher: createdBookChangeRequest.getPublisher() as string,
        releaseYear: createdBookChangeRequest.getReleaseYear() as number,
        language: createdBookChangeRequest.getLanguage(),
        translator: createdBookChangeRequest.getTranslator() as string,
        format: createdBookChangeRequest.getFormat(),
        pages: createdBookChangeRequest.getPages() as number,
        imageUrl: createdBookChangeRequest.getImageUrl() as string,
        bookId: book.id,
        userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'User does not exist.',
        id: userId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when no book data provided', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist();

    try {
      await createBookChangeRequestCommandHandler.execute({
        bookId: book.id,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'No book data provided to create a change request.',
        bookId: book.id,
        userId: user.id,
      });

      return;
    }

    expect.fail();
  });
});
