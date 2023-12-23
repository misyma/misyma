import { type UserTokensMapper } from './userTokensMapper.js';
import { UserTokens } from '../../../../domain/entities/userTokens/userTokens.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';

export class UserTokensMapperImpl implements UserTokensMapper {
  public mapToDomain(rawEntity: UserTokensRawEntity): UserTokens {
    const { id, userId, refreshToken, resetPasswordToken } = rawEntity;

    return new UserTokens({
      id,
      refreshToken,
      resetPasswordToken,
      userId,
    });
  }
}
