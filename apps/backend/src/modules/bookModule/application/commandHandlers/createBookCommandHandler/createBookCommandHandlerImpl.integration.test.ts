import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateBookCommandHandler } from './createBookCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('creates a Book', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const createdBook = bookTestFactory.create({
      authors: [
        new Author({
          firstName: author.firstName,
          lastName: author.lastName,
          id: author.id,
        }),
      ],
      bookshelfId: bookshelf.id,
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
      frontCoverImageUrl: createdBook.getFrontCoverImageUrl() as string,
      backCoverImageUrl: createdBook.getBackCoverImageUrl() as string,
      status: createdBook.getStatus(),
      bookshelfId: createdBook.getBookshelfId(),
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
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const authorId = Generator.uuid();

    const createdBook = bookTestFactory.create({
      bookshelfId: bookshelf.id,
    });

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
        frontCoverImageUrl: createdBook.getFrontCoverImageUrl() as string,
        backCoverImageUrl: createdBook.getBackCoverImageUrl() as string,
        status: createdBook.getStatus(),
        bookshelfId: createdBook.getBookshelfId(),
        authorIds: [authorId],
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Author',
      },
    });
  });

  it('throws an error - when provided Bookshelf does not exist', async () => {
    const author = await authorTestUtils.createAndPersist();

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
        frontCoverImageUrl: createdBook.getFrontCoverImageUrl() as string,
        backCoverImageUrl: createdBook.getBackCoverImageUrl() as string,
        status: createdBook.getStatus(),
        bookshelfId: createdBook.getBookshelfId(),
        authorIds: [author.id],
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Bookshelf',
      },
    });
  });
});
