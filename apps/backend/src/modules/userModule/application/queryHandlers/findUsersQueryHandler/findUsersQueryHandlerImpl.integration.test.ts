import { beforeEach, describe, expect, it } from 'vitest';

import { type FindUsersQueryHandler } from './findUsersQueryHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUsersQueryHandlerImpl', () => {
  let queryHandler: FindUsersQueryHandler;

  let userTestUtils: UserTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindUsersQueryHandler>(symbols.findUsersQueryHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
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
