import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BookshelfType } from '@common/contracts';

import { type CreateBookshelfCommandHandler } from './createBookshelfCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('CreateBookshelfCommandHandlerImpl', () => {
  let commandHandler: CreateBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBookshelfCommandHandler>(symbols.createBookshelfCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    testUtils = [bookshelfTestUtils, userTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  it('throws an error - when User does not exist', async () => {
    const nonExistentUserId = Generator.uuid();

    const name = Generator.word();

    expect(
      async () =>
        await commandHandler.execute({
          name,
          userId: nonExistentUserId,
          type: BookshelfType.standard,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User does not exist.',
        id: nonExistentUserId,
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

    try {
      await commandHandler.execute({
        name,
        userId: user.id,
        type: BookshelfType.standard,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });

  it('returns a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const name = Generator.word();

    const { bookshelf } = await commandHandler.execute({
      name,
      userId: user.id,
      type: BookshelfType.standard,
    });

    expect(bookshelf.getState()).toEqual({
      name,
      userId: user.id,
      type: bookshelf.getType(),
    });

    const persistedRawBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.getId(),
    });

    expect(persistedRawBookshelf).toMatchObject({
      id: bookshelf.getId(),
      name,
      userId: user.id,
      type: bookshelf.getType(),
    });
  });
});
