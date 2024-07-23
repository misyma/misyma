import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { type FindUsersQueryHandler } from './findUsersQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUsersQueryHandlerImpl', () => {
  let queryHandler: FindUsersQueryHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindUsersQueryHandler>(symbols.findUsersQueryHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('returns Users', async () => {
    const user1 = await userTestUtils.createAndPersist();

    const { users, total } = await queryHandler.execute({
      page: 1,
      pageSize: 10,
    });

    expect(users).toHaveLength(1);

    expect(users[0]?.getId()).toEqual(user1.id);

    expect(total).toEqual(1);
  });
});
