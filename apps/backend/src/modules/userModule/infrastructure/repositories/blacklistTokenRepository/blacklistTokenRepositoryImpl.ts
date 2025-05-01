import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BlacklistTokenRawEntity } from '../../../../databaseModule/infrastructure/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { blacklistTokensTable } from '../../../../databaseModule/infrastructure/tables/blacklistTokenTable/blacklistTokenTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type BlacklistToken } from '../../../domain/entities/blacklistToken/blacklistToken.js';
import {
  type BlacklistTokenRepository,
  type CreateBlacklistTokenPayload,
  type FindBlacklistTokenPayload,
} from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';

import { type BlacklistTokenMapper } from './blacklistTokenMapper/blacklistTokenMapper.js';

export class BlacklistTokenRepositoryImpl implements BlacklistTokenRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly blacklistTokenMapper: BlacklistTokenMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async createBlacklistToken(payload: CreateBlacklistTokenPayload): Promise<BlacklistToken> {
    const { token, expiresAt } = payload;

    let rawEntities: BlacklistTokenRawEntity[];

    try {
      rawEntities = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokensTable).insert(
        {
          id: this.uuidService.generateUuid(),
          token,
          expiresAt,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'BlacklistToken',
        operation: 'create',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as BlacklistTokenRawEntity;

    return this.blacklistTokenMapper.mapToDomain(rawEntity);
  }

  public async findBlacklistToken(payload: FindBlacklistTokenPayload): Promise<BlacklistToken | null> {
    const { token } = payload;

    let rawEntity: BlacklistTokenRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokensTable)
        .select('*')
        .where({ token })
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'BlacklistToken',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.blacklistTokenMapper.mapToDomain(rawEntity);
  }
}
