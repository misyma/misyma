import { describe, it, beforeEach, expect, afterEach } from 'vitest';

import { type FindBookshelfByIdQueryHandler } from './findBookshelfByIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('FindBookshelfByIdQueryHandler', () => {
  let queryHandler: FindBookshelfByIdQueryHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookshelfByIdQueryHandler>(symbols.findBookshelfByIdQueryHandler);

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
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          bookshelfId: nonExistentBookshelfId,
          userId: Generator.uuid(),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Bookshelf',
      },
    });
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
    });
  });
});
