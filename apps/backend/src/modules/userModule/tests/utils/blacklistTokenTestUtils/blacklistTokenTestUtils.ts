import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BlacklistTokenRawEntity } from '../../../../databaseModule/infrastructure/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { blacklistTokensTable } from '../../../../databaseModule/infrastructure/tables/blacklistTokenTable/blacklistTokenTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BlacklistTokenTestFactory } from '../../factories/blacklistTokenTestFactory/blacklistTokenTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BlacklistTokenRawEntity>;
}

interface PersistPayload {
  readonly blacklistToken: BlacklistTokenRawEntity;
}

interface FindByTokenPayload {
  readonly token: string;
}

export class BlacklistTokenTestUtils extends TestUtils {
  private readonly blacklistTokenTestFactory = new BlacklistTokenTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, blacklistTokensTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BlacklistTokenRawEntity> {
    const { input } = payload;

    const blacklistToken = this.blacklistTokenTestFactory.create(input);

    const rawEntities = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokensTable).insert(
      {
        id: blacklistToken.getId(),
        token: blacklistToken.getToken(),
        expires_at: blacklistToken.getExpiresAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BlacklistTokenRawEntity;

    return rawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { blacklistToken } = payload;

    await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokensTable).insert(blacklistToken, '*');
  }

  public async findByToken(payload: FindByTokenPayload): Promise<BlacklistTokenRawEntity> {
    const { token } = payload;

    const rawEntity = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokensTable)
      .select('*')
      .where({ token })
      .first();

    return rawEntity as BlacklistTokenRawEntity;
  }
}
