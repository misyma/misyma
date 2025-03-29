import { describe, it, beforeEach, expect, afterEach } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

import { type FindBookshelfByIdQueryHandler } from './findBookshelfByIdQueryHandler.js';

describe('FindBookshelfByIdQueryHandler', () => {
  let queryHandler: FindBookshelfByIdQueryHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    queryHandler = container.get<FindBookshelfByIdQueryHandler>(symbols.findBookshelfByIdQueryHandler);

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

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    try {
      await queryHandler.execute({
        bookshelfId: nonExistentBookshelfId,
        userId: Generator.uuid(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toMatchObject({
        resource: 'Bookshelf',
      });

      return;
    }

    expect.fail();
  });

  it('returns a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const createdBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const { bookshelf } = await queryHandler.execute({
      bookshelfId: createdBookshelf.id,
      userId: user.id,
    });

    expect(bookshelf).toBeInstanceOf(Bookshelf);

    expect(bookshelf.getState()).toEqual({
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
      type: bookshelf.getType(),
      createdAt: expect.any(Date),
      imageUrl: bookshelf.getImageUrl(),
      bookCount: 0,
    });
  });
});
