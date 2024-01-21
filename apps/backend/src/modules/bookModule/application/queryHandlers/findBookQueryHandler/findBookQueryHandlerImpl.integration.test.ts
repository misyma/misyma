import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookQueryHandler } from './findBookQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBookQueryHandler', () => {
  let findBookQueryHandler: FindBookQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    findBookQueryHandler = container.get<FindBookQueryHandler>(symbols.findBookQueryHandler);

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

  it('finds book by id', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          bookshelfId: bookshelf.id,
        },
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
