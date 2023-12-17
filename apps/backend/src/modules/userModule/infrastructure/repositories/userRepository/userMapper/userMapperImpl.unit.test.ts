import { beforeEach, expect, describe, it } from 'vitest';

import { UserMapperImpl } from './userMapperImpl.js';
import { UserRawEntityTestFactory } from '../../../../tests/factories/userRawEntityTestFactory/userRawEntityTestFactory.js';

describe('UserMapperImpl', () => {
  let userMapperImpl: UserMapperImpl;

  const userEntityTestFactory = new UserRawEntityTestFactory();

  beforeEach(async () => {
    userMapperImpl = new UserMapperImpl();
  });

  it('maps from user raw entity to domain user', async () => {
    const userEntity = userEntityTestFactory.create();

    const user = userMapperImpl.mapToDomain(userEntity);

    expect(user).toEqual({
      id: userEntity.id,
      email: userEntity.email,
      password: userEntity.password,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
    });
  });
});
