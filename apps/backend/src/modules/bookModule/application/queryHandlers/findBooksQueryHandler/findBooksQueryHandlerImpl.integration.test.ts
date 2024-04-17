import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBooksQueryHandler } from './findBooksQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBooksQueryHandler', () => {
  let findBooksQueryHandler: FindBooksQueryHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    findBooksQueryHandler = container.get<FindBooksQueryHandler>(symbols.findBooksQueryHandler);

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

  it('finds books', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          isApproved: true,
        },
      },
    });

    const { books } = await findBooksQueryHandler.execute({});

    expect(books.length).toEqual(1);

    expect(books[0]?.getId()).toEqual(book.id);
  });

  it('finds books by isbn', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          isApproved: true,
        },
      },
    });

    const { books } = await findBooksQueryHandler.execute({ isbn: book.isbn as string });

    expect(books.length).toEqual(1);

    expect(books[0]?.getIsbn()).toEqual(book.isbn);
  });

  it('finds books by title', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          isApproved: true,
          title: 'Game of Thrones',
        },
      },
    });

    const { books } = await findBooksQueryHandler.execute({ title: 'game' });

    expect(books).toHaveLength(1);

    expect(books[0]?.getTitle()).toEqual(book.title);
  });

  it('finds no books if they are not approved', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          isApproved: false,
        },
      },
    });

    const { books } = await findBooksQueryHandler.execute({ isbn: book.isbn as string });

    expect(books.length).toEqual(0);
  });
});
