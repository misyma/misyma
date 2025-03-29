import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindBookshelvesQueryHandler } from './findBookshelvesQueryHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('FindBookshelvesQueryHandlerImpl', () => {
  let queryHandler: FindBookshelvesQueryHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    queryHandler = container.get<FindBookshelvesQueryHandler>(symbols.findBookshelvesByUserIdQueryHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    testUtils = [userTestUtils, bookshelfTestUtils];

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

  it('throws an error - when User was not found', async () => {
    const nonExistentUserId = Generator.uuid();

    try {
      await queryHandler.execute({
        userId: nonExistentUserId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toMatchObject({
        resource: 'User',
      });

      return;
    }

    expect.fail();
  });

  it('returns an empty array - when User has no Bookshelves', async () => {
    const user = await userTestUtils.createAndPersist();

    const { bookshelves, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookshelves.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns User Bookshelves', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const bookshelf2 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const { bookshelves, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookshelves.length).toEqual(2);

    expect(bookshelves.find((bookshelf) => bookshelf.getId() === bookshelf1.id)?.getState()).toEqual({
      name: bookshelf1.name,
      userId: bookshelf1.userId,
      type: bookshelf1.type,
      createdAt: expect.any(Date),
      imageUrl: bookshelf1.imageUrl,
      bookCount: 0,
    });

    expect(bookshelves.find((bookshelf) => bookshelf.getId() === bookshelf2.id)?.getState()).toEqual({
      name: bookshelf2.name,
      userId: bookshelf2.userId,
      type: bookshelf2.type,
      createdAt: expect.any(Date),
      imageUrl: bookshelf2.imageUrl,
      bookCount: 0,
    });

    expect(total).toEqual(2);
  });
});
