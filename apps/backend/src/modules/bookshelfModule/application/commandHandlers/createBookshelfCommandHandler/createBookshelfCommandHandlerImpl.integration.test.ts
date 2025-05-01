import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

import { type CreateBookshelfCommandHandler } from './createBookshelfCommandHandler.js';

describe('CreateBookshelfCommandHandlerImpl', () => {
  let commandHandler: CreateBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let databaseClient: DatabaseClient;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

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

    await databaseClient.destroy();
  });

  it('throws an error - when User does not exist', async () => {
    const nonExistentUserId = Generator.uuid();

    const name = Generator.word();

    try {
      await commandHandler.execute({
        name,
        userId: nonExistentUserId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User does not exist.',
        id: nonExistentUserId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Bookshelf with this name already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const name = Generator.word();

    await bookshelfTestUtils.createAndPersist({
      input: {
        name,
        user_id: user.id,
      },
    });

    try {
      await commandHandler.execute({
        name,
        userId: user.id,
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

    const imageUrl = Generator.imageUrl();

    const { bookshelf } = await commandHandler.execute({
      name,
      userId: user.id,
      imageUrl,
    });

    expect(bookshelf.getState()).toEqual({
      name,
      userId: user.id,
      type: bookshelf.getType(),
      createdAt: expect.any(Date),
      imageUrl,
    });

    const persistedRawBookshelf = await bookshelfTestUtils.findById({ id: bookshelf.getId() });

    expect(persistedRawBookshelf).toMatchObject({
      id: bookshelf.getId(),
      name,
      user_id: user.id,
      type: bookshelf.getType(),
      created_at: expect.any(Date),
      image_url: imageUrl,
    });
  });
});
