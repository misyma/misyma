import { type UserTokensMapper } from './userTokensMapper.js';
import { UserTokens } from '../../../../domain/entities/userTokens/userTokens.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';

export class UserTokensMapperImpl implements UserTokensMapper {
  public mapToDomain(rawEntity: UserTokensRawEntity): UserTokens {
    const { id, userId, refreshToken, resetPasswordToken, emailVerificationToken } = rawEntity;

    return new UserTokens({
      id,
      userId,
      refreshToken,
      resetPasswordToken,
      emailVerificationToken,
    });
  }
}
