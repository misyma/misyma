import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

import { type FindUsersQueryHandler } from './findUsersQueryHandler.js';

describe('FindUsersQueryHandlerImpl', () => {
  let queryHandler: FindUsersQueryHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    queryHandler = container.get<FindUsersQueryHandler>(symbols.findUsersQueryHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

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
