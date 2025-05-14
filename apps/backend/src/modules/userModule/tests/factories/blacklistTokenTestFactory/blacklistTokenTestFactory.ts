import { Generator } from '../../../../../../tests/generator.js';
import { type BlacklistTokenRawEntity } from '../../../../databaseModule/infrastructure/tables/blacklistTokensTable/blacklistTokenRawEntity.js';
import { type BlacklistTokenDraft, BlacklistToken } from '../../../domain/entities/blacklistToken/blacklistToken.js';

export class BlacklistTokenTestFactory {
  public create(input: Partial<BlacklistTokenDraft> = {}): BlacklistToken {
    return new BlacklistToken({
      id: Generator.uuid(),
      token: Generator.alphaString(32),
      expiresAt: Generator.futureDate(),
      ...input,
    });
  }

  public createRaw(input: Partial<BlacklistTokenRawEntity> = {}): BlacklistTokenRawEntity {
    return {
      id: Generator.uuid(),
      token: Generator.alphaString(32),
      expires_at: Generator.futureDate(),
      ...input,
    };
  }
}
