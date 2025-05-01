import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

import { type FindBookChangeRequestsQueryHandler } from './findBookChangeRequestsQueryHandler.js';

describe('FindBookChangeRequestsQueryHandler', () => {
  let findBookChangeRequestsQueryHandler: FindBookChangeRequestsQueryHandler;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    findBookChangeRequestsQueryHandler = container.get<FindBookChangeRequestsQueryHandler>(
      symbols.findBookChangeRequestsQueryHandler,
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

  it('finds bookChangeRequests', async () => {
    const user = await userTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          categoryId: category.id,
        },
      },
    });

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        userEmail: user.email,
        bookId: book.id,
      },
    });

    const { bookChangeRequests, total } = await findBookChangeRequestsQueryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(bookChangeRequests.length).toEqual(1);

    expect(bookChangeRequests[0]?.getId()).toEqual(bookChangeRequest.id);

    expect(total).toEqual(1);
  });

  it('finds bookChangeRequests by user', async () => {
    const user = await userTestUtils.createAndPersist();

    const category = await categoryTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          categoryId: category.id,
        },
      },
    });

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        userEmail: user.email,
        bookId: book.id,
      },
    });

    const { bookChangeRequests, total } = await findBookChangeRequestsQueryHandler.execute({
      page: 1,
      pageSize: 10,
      userId: user.id,
    });

    expect(bookChangeRequests.length).toEqual(1);

    expect(bookChangeRequests[0]?.getId()).toEqual(bookChangeRequest.id);

    expect(total).toEqual(1);
  });
});
