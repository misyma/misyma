import { type BlacklistTokenRawEntity } from '../../../../../databaseModule/infrastructure/tables/blacklistTokensTable/blacklistTokenRawEntity.js';
import { BlacklistToken } from '../../../../domain/entities/blacklistToken/blacklistToken.js';

import { type BlacklistTokenMapper } from './blacklistTokenMapper.js';

export class BlacklistTokenMapperImpl implements BlacklistTokenMapper {
  public mapToDomain(entity: BlacklistTokenRawEntity): BlacklistToken {
    const { id, token, expires_at: expiresAt } = entity;

    return new BlacklistToken({
      id,
      expiresAt,
      token,
    });
  }
}
