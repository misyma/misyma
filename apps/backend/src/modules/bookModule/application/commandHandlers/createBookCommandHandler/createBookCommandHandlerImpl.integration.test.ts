import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateBookCommandHandler } from './createBookCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('creates a Book', async () => {
    const author = await authorTestUtils.createAndPersist();

    const createdBook = bookTestFactory.create({
      authors: [
        new Author({
          firstName: author.firstName,
          lastName: author.lastName,
          id: author.id,
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
      authorIds: [author.id],
    });

    const foundBook = await bookTestUtils.findByTitleAndAuthor({
      title: createdBook.getTitle(),
      authorId: author.id,
    });

    expect(book.getTitle()).toEqual(createdBook.getTitle());

    expect(foundBook.title).toEqual(createdBook.getTitle());
  });

  it('throws an error - when provided Authors do not exist', async () => {
    const authorId = Generator.uuid();

    const createdBook = bookTestFactory.create();

    await expect(async () =>
      createBookCommandHandler.execute({
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn() as string,
        publisher: createdBook.getPublisher() as string,
        releaseYear: createdBook.getReleaseYear() as number,
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator() as string,
        format: createdBook.getFormat(),
        pages: createdBook.getPages() as number,
        authorIds: [authorId],
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Author',
      },
    });
  });
});
