import { beforeEach, expect, describe, it } from 'vitest';

import { UserMapperImpl } from './userMapperImpl.js';
import { UserTestFactory } from '../../../../tests/factories/userTestFactory/userTestFactory.js';

describe('UserMapperImpl', () => {
  let userMapperImpl: UserMapperImpl;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    userMapperImpl = new UserMapperImpl();
  });

  it('maps from UserRawEntity to User', async () => {
    const userEntity = userTestFactory.createRaw();

    const user = userMapperImpl.mapToDomain(userEntity);

    expect(user.getId()).toEqual(userEntity.id);

    expect(user.getState()).toEqual({
      email: userEntity.email,
      password: userEntity.password,
      name: userEntity.name,
      isEmailVerified: userEntity.isEmailVerified,
      role: userEntity.role,
    });
  });
});
