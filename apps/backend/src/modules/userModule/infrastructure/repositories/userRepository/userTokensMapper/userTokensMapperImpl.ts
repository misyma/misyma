import { type UserTokensMapper } from './userTokensMapper.js';
import { UserTokens, type UserTokensDraft } from '../../../../domain/entities/userTokens/userTokens.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';

export class UserTokensMapperImpl implements UserTokensMapper {
  public mapToDomain(rawEntity: UserTokensRawEntity): UserTokens {
    const { id, userId, refreshToken, resetPasswordToken, emailVerificationToken } = rawEntity;

    let userTokensDraft: UserTokensDraft = {
      id,
      userId,
      refreshToken,
    };

    if (resetPasswordToken) {
      userTokensDraft = {
        ...userTokensDraft,
        resetPasswordToken,
      };
    }

    if (emailVerificationToken) {
      userTokensDraft = {
        ...userTokensDraft,
        emailVerificationToken,
      };
    }

    return new UserTokens(userTokensDraft);
  }
}
