import { type UserTokens } from '../../../../domain/entities/userTokens/userTokens.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';

export interface UserTokensMapper {
  mapToDomain(rawEntity: UserTokensRawEntity): UserTokens;
}
