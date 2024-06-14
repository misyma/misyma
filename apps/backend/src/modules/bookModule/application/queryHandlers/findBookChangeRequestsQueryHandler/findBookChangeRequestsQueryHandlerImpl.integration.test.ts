import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBookChangeRequestsQueryHandler } from './findBookChangeRequestsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBookChangeRequestsQueryHandler', () => {
  let findBookChangeRequestsQueryHandler: FindBookChangeRequestsQueryHandler;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    findBookChangeRequestsQueryHandler = container.get<FindBookChangeRequestsQueryHandler>(
      symbols.findBookChangeRequestsQueryHandler,
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

  it('finds bookChangeRequests', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist();

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        userId: user.id,
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

    const book = await bookTestUtils.createAndPersist();

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        userId: user.id,
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
