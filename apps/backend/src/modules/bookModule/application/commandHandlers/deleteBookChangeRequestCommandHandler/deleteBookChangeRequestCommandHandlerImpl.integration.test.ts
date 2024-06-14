import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteBookChangeRequestCommandHandler } from './deleteBookChangeRequestCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('DeleteBookChangeRequestCommandHandler', () => {
  let deleteBookChangeRequestCommandHandler: DeleteBookChangeRequestCommandHandler;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    deleteBookChangeRequestCommandHandler = container.get<DeleteBookChangeRequestCommandHandler>(
      symbols.deleteBookChangeRequestCommandHandler,
    );

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils];

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

  it('deletes bookChangeRequest', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist();

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        userId: user.id,
        bookId: book.id,
      },
    });

    await deleteBookChangeRequestCommandHandler.execute({ bookChangeRequestId: bookChangeRequest.id });

    const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.id });

    expect(foundBookChangeRequest).toBeUndefined();
  });

  it('throws an error if bookChangeRequest with given id does not exist', async () => {
    const id = Generator.uuid();

    try {
      await deleteBookChangeRequestCommandHandler.execute({ bookChangeRequestId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toEqual({
        resource: 'BookChangeRequest',
        id,
      });

      return;
    }

    expect.fail();
  });
});
