import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateBookCommandHandler } from './updateBookCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('UpdateBookCommandHandlerImpl', () => {
  let commandHandler: UpdateBookCommandHandler;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBookCommandHandler>(symbols.updateBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

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

  it('throws an error - when Book does not exist', async () => {
    const nonExistentBookId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookId: nonExistentBookId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when updated Author does not exist', async () => {
    const book = await bookTestUtils.createAndPersist();

    const invalidAuthorId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookId: book.id,
        authorIds: [invalidAuthorId],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('updates a Book', async () => {
    const book = await bookTestUtils.createAndPersist();

    const updatedImageUrl = Generator.imageUrl();

    const updatedTitle = Generator.word();

    const updatedPublisher = Generator.word();

    const updatedReleaseYear = Generator.number(1950, 2024);

    const updatedLanguage = Generator.language();

    const updatedTranslator = Generator.fullName();

    const updatedFormat = Generator.bookFormat();

    const updatedPages = Generator.number(100, 1000);

    const updatedIsApproved = Generator.boolean();

    const updatedIsbn = Generator.isbn();

    const updatedAuthor = await authorTestUtils.createAndPersist();

    const { book: updatedBook } = await commandHandler.execute({
      bookId: book.id,
      authorIds: [updatedAuthor.id],
      format: updatedFormat,
      imageUrl: updatedImageUrl,
      language: updatedLanguage,
      pages: updatedPages,
      publisher: updatedPublisher,
      releaseYear: updatedReleaseYear,
      title: updatedTitle,
      translator: updatedTranslator,
      isApproved: updatedIsApproved,
      isbn: updatedIsbn,
    });

    expect(updatedBook.getId()).toBe(book.id);

    expect(updatedBook.getImageUrl()).toBe(updatedImageUrl);

    expect(updatedBook.getTitle()).toBe(updatedTitle);

    expect(updatedBook.getIsbn()).toBe(updatedIsbn);

    expect(updatedBook.getPublisher()).toBe(updatedPublisher);

    expect(updatedBook.getReleaseYear()).toBe(updatedReleaseYear);

    expect(updatedBook.getLanguage()).toBe(updatedLanguage);

    expect(updatedBook.getTranslator()).toBe(updatedTranslator);

    expect(updatedBook.getFormat()).toBe(updatedFormat);

    expect(updatedBook.getPages()).toBe(updatedPages);

    expect(updatedBook.getIsApproved()).toBe(updatedIsApproved);

    expect(updatedBook.getAuthors()).toHaveLength(1);

    expect(updatedBook.getAuthors()?.[0]?.getId()).toBe(updatedAuthor.id);
  });
});
