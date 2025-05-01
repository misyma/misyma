import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type DeleteBookChangeRequestCommandHandler } from './deleteBookChangeRequestCommandHandler.js';

describe('DeleteBookChangeRequestCommandHandler', () => {
  let deleteBookChangeRequestCommandHandler: DeleteBookChangeRequestCommandHandler;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    deleteBookChangeRequestCommandHandler = container.get<DeleteBookChangeRequestCommandHandler>(
      symbols.deleteBookChangeRequestCommandHandler,
    );

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils, categoryTestUtils];

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
    const category = await categoryTestUtils.createAndPersist();

    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          category_id: category.id,
        },
      },
    });

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        user_email: user.email,
        book_id: book.id,
      },
    });

    await deleteBookChangeRequestCommandHandler.execute({ bookChangeRequestId: bookChangeRequest.id });

    const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.id });

    expect(foundBookChangeRequest).toBeNull();
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
