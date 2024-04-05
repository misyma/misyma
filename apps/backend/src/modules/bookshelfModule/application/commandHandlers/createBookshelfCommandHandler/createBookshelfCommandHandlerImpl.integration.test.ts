import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateBookshelfCommandHandler } from './createBookshelfCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('CreateBookshelfCommandHandlerImpl', () => {
  let commandHandler: CreateBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBookshelfCommandHandler>(symbols.createBookshelfCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  it('throws an error - when User does not exist', async () => {
    const nonExistentUserId = Generator.uuid();

    const name = Generator.word();

    expect(
      async () =>
        await commandHandler.execute({
          name,
          userId: nonExistentUserId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
      },
    });
  });

  it('throws an error - when Bookshelf with this name already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const name = Generator.word();

    await bookshelfTestUtils.createAndPersist({
      input: {
        name,
        userId: user.id,
      },
    });

    expect(
      async () =>
        await commandHandler.execute({
          name,
          userId: user.id,
        }),
    ).toThrowErrorInstance({ instance: OperationNotValidError });
  });

  it('returns a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const name = Generator.word();

    const imageUrl = Generator.imageUrl();

    const { bookshelf } = await commandHandler.execute({
      name,
      userId: user.id,
      imageUrl,
    });

    expect(bookshelf.getState()).toEqual({
      name,
      userId: user.id,
      address: null,
      imageUrl,
    });

    const persistedRawBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.getId(),
    });

    expect(persistedRawBookshelf).toMatchObject({
      id: bookshelf.getId(),
      name,
      userId: user.id,
      address: null,
      imageUrl,
    });
  });
});
