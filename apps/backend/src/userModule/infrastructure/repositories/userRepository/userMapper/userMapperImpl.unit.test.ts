import { beforeEach, expect, describe, it } from 'vitest';

import { UserMapperImpl } from './userMapperImpl.js';
import { UserRawEntityTestFactory } from '../../../../tests/factories/userRawEntityTestFactory/userRawEntityTestFactory.js';

describe('UserMapperImpl', () => {
  let userMapperImpl: UserMapperImpl;

  const userEntityTestFactory = new UserRawEntityTestFactory();

  beforeEach(async () => {
    userMapperImpl = new UserMapperImpl();
  });

  it('maps a user entity to a user', async () => {
    const userEntity = userEntityTestFactory.create();

    const user = userMapperImpl.map(userEntity);

    expect(user).toEqual({
      id: userEntity.id,
      email: userEntity.email,
      password: userEntity.password,
    });
  });
});
