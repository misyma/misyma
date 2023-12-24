import { describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { UserTokensMapperImpl } from './userTokensMapperImpl.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';

describe('UserTokensMapperImpl', () => {
  const userTokensMapper = new UserTokensMapperImpl();

  it('maps from UserTokensRawEntity to UserTokens', () => {
    const userTokensRawEntity: UserTokensRawEntity = {
      id: Generator.uuid(),
      refreshToken: Generator.string(20),
      resetPasswordToken: Generator.string(20),
      emailVerificationToken: Generator.string(20),
      userId: Generator.uuid(),
    };

    const userTokens = userTokensMapper.mapToDomain(userTokensRawEntity);

    expect(userTokens).toEqual({
      id: userTokensRawEntity.id,
      refreshToken: userTokensRawEntity.refreshToken,
      resetPasswordToken: userTokensRawEntity.resetPasswordToken,
      emailVerificationToken: userTokensRawEntity.emailVerificationToken,
      userId: userTokensRawEntity.userId,
    });
  });
});
