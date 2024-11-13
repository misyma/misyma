import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateBookCommandHandler } from './createBookCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { Author } from '../../../domain/entities/author/author.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    testUtils = [authorTestUtils, bookTestUtils];

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

  it('creates a Book', async () => {
    const author = await authorTestUtils.createAndPersist({ input: { isApproved: true } });

    const createdBook = bookTestFactory.create({
      authors: [
        new Author({
          id: author.id,
          name: author.name,
          isApproved: author.isApproved,
          createdAt: author.createdAt,
        }),
      ],
    });

    const { book } = await createBookCommandHandler.execute({
      title: createdBook.getTitle(),
      isbn: createdBook.getIsbn() as string,
      publisher: createdBook.getPublisher() as string,
      releaseYear: createdBook.getReleaseYear() as number,
      language: createdBook.getLanguage(),
      translator: createdBook.getTranslator() as string,
      format: createdBook.getFormat(),
      pages: createdBook.getPages() as number,
      isApproved: createdBook.getIsApproved(),
      imageUrl: createdBook.getImageUrl() as string,
      authorIds: [author.id],
    });

    const foundBook = await bookTestUtils.findByTitleAndAuthor({
      title: createdBook.getTitle(),
      authorId: author.id,
    });

    expect(book.getTitle()).toEqual(createdBook.getTitle());

    expect(foundBook?.title).toEqual(createdBook.getTitle());
  });

  it('throws an error - when provided Authors do not exist', async () => {
    const authorId = Generator.uuid();

    const createdBook = bookTestFactory.create();

    try {
      await createBookCommandHandler.execute({
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn() as string,
        publisher: createdBook.getPublisher() as string,
        releaseYear: createdBook.getReleaseYear() as number,
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator() as string,
        format: createdBook.getFormat(),
        pages: createdBook.getPages() as number,
        isApproved: createdBook.getIsApproved(),
        imageUrl: createdBook.getImageUrl() as string,
        authorIds: [authorId],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Provided Authors do not exist.',
        missingIds: [authorId],
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Authors are not provided', async () => {
    const createdBook = bookTestFactory.create();

    try {
      await createBookCommandHandler.execute({
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn() as string,
        publisher: createdBook.getPublisher() as string,
        releaseYear: createdBook.getReleaseYear() as number,
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator() as string,
        format: createdBook.getFormat(),
        pages: createdBook.getPages() as number,
        isApproved: createdBook.getIsApproved(),
        imageUrl: createdBook.getImageUrl() as string,
        authorIds: [],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Book must have at least one author.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when provided ISBN is already taken', async () => {
    const author = await authorTestUtils.createAndPersist({ input: { isApproved: true } });

    const isbn = Generator.isbn();

    const existingBook = await bookTestUtils.createAndPersist({
      input: {
        book: {
          isbn,
          isApproved: true,
        },
      },
    });

    try {
      await createBookCommandHandler.execute({
        title: existingBook.title,
        isbn,
        publisher: existingBook.publisher as string,
        releaseYear: existingBook.releaseYear as number,
        language: existingBook.language,
        translator: existingBook.translator as string,
        format: existingBook.format,
        pages: existingBook.pages as number,
        isApproved: existingBook.isApproved,
        imageUrl: existingBook.imageUrl as string,
        authorIds: [author.id],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Book',
        isbn,
        existingBookId: existingBook.id,
      });

      return;
    }

    expect.fail();
  });
});
