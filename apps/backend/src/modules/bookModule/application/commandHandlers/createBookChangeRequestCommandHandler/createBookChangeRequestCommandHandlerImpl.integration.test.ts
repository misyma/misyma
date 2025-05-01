import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookChangeRequestTestFactory } from '../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';

import { type CreateBookChangeRequestCommandHandler } from './createBookChangeRequestCommandHandler.js';

describe('CreateBookChangeRequestCommandHandler', () => {
  let createBookChangeRequestCommandHandler: CreateBookChangeRequestCommandHandler;

  let databaseClient: DatabaseClient;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  const testUserId = Generator.uuid();

  let testDataOrchestrator: TestDataOrchestrator;

  const bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    createBookChangeRequestCommandHandler = container.get<CreateBookChangeRequestCommandHandler>(
      symbols.createBookChangeRequestCommandHandler,
    );

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [userTestUtils, bookChangeRequestTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    testDataOrchestrator.setUserId(testUserId);
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('creates a BookChangeRequest', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await testDataOrchestrator.createBook();

    const author2 = await authorTestUtils.createAndPersist();

    const createdBookChangeRequest = bookChangeRequestTestFactory.create();

    const { bookChangeRequest } = await createBookChangeRequestCommandHandler.execute({
      title: createdBookChangeRequest.getTitle(),
      isbn: createdBookChangeRequest.getIsbn() as string,
      publisher: createdBookChangeRequest.getPublisher() as string,
      releaseYear: createdBookChangeRequest.getReleaseYear(),
      language: createdBookChangeRequest.getLanguage(),
      translator: createdBookChangeRequest.getTranslator() as string,
      format: createdBookChangeRequest.getFormat(),
      pages: createdBookChangeRequest.getPages() as number,
      imageUrl: null,
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
      imageUrl: null,
      authorIds: [author2.id],
      bookTitle: book.title,
      changedFields: [
        'title',
        'isbn',
        'publisher',
        'releaseYear',
        'language',
        'translator',
        'format',
        'pages',
        'imageUrl',
        'authorIds',
      ],
    });

    const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.getId() });

    expect(foundBookChangeRequest).toEqual({
      id: bookChangeRequest.getId(),
      book_id: book.id,
      user_email: user.email,
      created_at: expect.any(Date),
      format: createdBookChangeRequest.getFormat(),
      title: createdBookChangeRequest.getTitle(),
      isbn: createdBookChangeRequest.getIsbn(),
      publisher: createdBookChangeRequest.getPublisher(),
      release_year: createdBookChangeRequest.getReleaseYear(),
      language: createdBookChangeRequest.getLanguage(),
      translator: createdBookChangeRequest.getTranslator(),
      pages: createdBookChangeRequest.getPages(),
      image_url: null,
      author_ids: author2.id,
      changed_fields: 'title,isbn,publisher,releaseYear,language,translator,format,pages,imageUrl,authorIds',
    });
  });

  it('throws an error - when some of the authors do not exist', async () => {
    const book = await testDataOrchestrator.createBook();

    const authorIds = [Generator.uuid(), Generator.uuid()];

    try {
      await createBookChangeRequestCommandHandler.execute({
        authorIds,
        bookId: book.id,
        userId: testUserId,
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
        releaseYear: createdBookChangeRequest.getReleaseYear(),
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

    const book = await testDataOrchestrator.createBook();

    const createdBookChangeRequest = bookChangeRequestTestFactory.create({
      bookId: book.id,
    });

    try {
      await createBookChangeRequestCommandHandler.execute({
        title: createdBookChangeRequest.getTitle(),
        isbn: createdBookChangeRequest.getIsbn() as string,
        publisher: createdBookChangeRequest.getPublisher() as string,
        releaseYear: createdBookChangeRequest.getReleaseYear(),
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
    const book = await testDataOrchestrator.createBook();

    try {
      await createBookChangeRequestCommandHandler.execute({
        bookId: book.id,
        userId: testUserId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'No book data provided to create a change request.',
        bookId: book.id,
        userId: testUserId,
      });

      return;
    }

    expect.fail();
  });
});
