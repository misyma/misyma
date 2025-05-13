import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type AuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorRawEntity.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorsTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { AuthorTestFactory } from '../../factories/authorTestFactory/authorTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<AuthorRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByNamePayload {
  readonly name: string;
}

export class AuthorTestUtils extends TestUtils {
  private readonly authorTestFactory = new AuthorTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, authorsTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<AuthorRawEntity> {
    const { input } = payload;

    const author = this.authorTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<AuthorRawEntity>(authorsTable).insert(author, '*');

    const rawEntity = rawEntities[0] as AuthorRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<AuthorRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<AuthorRawEntity>(authorsTable).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findByName(payload: FindByNamePayload): Promise<AuthorRawEntity | undefined> {
    const { name } = payload;

    const rawEntity = await this.databaseClient<AuthorRawEntity>(authorsTable).select('*').where({ name }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }
}
