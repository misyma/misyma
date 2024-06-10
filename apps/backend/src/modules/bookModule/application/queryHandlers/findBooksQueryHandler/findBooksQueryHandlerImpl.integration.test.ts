import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBooksQueryHandler } from './findBooksQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBooksQueryHandler', () => {
  let findBooksQueryHandler: FindBooksQueryHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    findBooksQueryHandler = container.get<FindBooksQueryHandler>(symbols.findBooksQueryHandler);

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

    const { books, total } = await findBooksQueryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(books.length).toEqual(1);

    expect(books[0]?.getId()).toEqual(book.id);

    expect(total).toEqual(1);
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

    const { books, total } = await findBooksQueryHandler.execute({
      isbn: book.isbn as string,
      page: 1,
      pageSize: 10,
    });

    expect(books.length).toEqual(1);

    expect(books[0]?.getIsbn()).toEqual(book.isbn);

    expect(total).toEqual(1);
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

    const { books, total } = await findBooksQueryHandler.execute({
      title: 'game',
      page: 1,
      pageSize: 10,
    });

    expect(books).toHaveLength(1);

    expect(books[0]?.getTitle()).toEqual(book.title);

    expect(total).toEqual(1);
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

    const { books, total } = await findBooksQueryHandler.execute({
      isbn: book.isbn as string,
      page: 1,
      pageSize: 10,
      isApproved: true,
    });

    expect(books.length).toEqual(0);

    expect(total).toEqual(0);
  });
});
