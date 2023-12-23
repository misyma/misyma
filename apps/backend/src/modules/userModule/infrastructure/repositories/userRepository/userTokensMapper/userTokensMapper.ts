import { type UserTokens } from '../../../../domain/entities/userTokens/userTokens.js';
import { type UserTokensRawEntity } from '../../../databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';

export interface UserTokensMapper {
  mapToDomain(rawEntity: UserTokensRawEntity): UserTokens;
}
