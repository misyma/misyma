import { describe, it, beforeEach, expect, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookshelfByIdQueryHandler } from './findBookshelfByIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('FindBookshelfByIdQueryHandler', () => {
  let queryHandler: FindBookshelfByIdQueryHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookshelfByIdQueryHandler>(symbols.findBookshelfByIdQueryHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  afterEach(async () => {
    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          id: nonExistentBookshelfId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Bookshelf',
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
      id: createdBookshelf.id,
    });

    expect(bookshelf).toBeInstanceOf(Bookshelf);

    expect(bookshelf.getState()).toMatchObject(<Partial<BookshelfState>>{
      addressId: bookshelf.getAddressId(),
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
    });
  });
});
