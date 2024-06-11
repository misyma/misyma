import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBookQueryHandler } from './findBookQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBookQueryHandler', () => {
  let findBookQueryHandler: FindBookQueryHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    findBookQueryHandler = container.get<FindBookQueryHandler>(symbols.findBookQueryHandler);

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

  it('finds book by id', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    const { book: foundBook } = await findBookQueryHandler.execute({ bookId: book.id });

    expect(foundBook).not.toBeNull();
  });

  it('throws an error if book with given id does not exist', async () => {
    const id = Generator.uuid();

    try {
      await findBookQueryHandler.execute({ bookId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
