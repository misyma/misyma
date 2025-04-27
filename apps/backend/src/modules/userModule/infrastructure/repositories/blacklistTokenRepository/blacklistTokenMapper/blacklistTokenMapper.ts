import { type BlacklistTokenRawEntity } from '../../../../../databaseModule/infrastructure/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { type BlacklistToken } from '../../../../domain/entities/blacklistToken/blacklistToken.js';

export interface BlacklistTokenMapper {
  mapToDomain(rawEntity: BlacklistTokenRawEntity): BlacklistToken;
}
