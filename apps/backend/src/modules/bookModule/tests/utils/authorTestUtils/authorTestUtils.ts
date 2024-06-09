import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/authorTable/authorRawEntity.js';
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

export class AuthorTestUtils {
  private readonly authorTestFactory = new AuthorTestFactory();

  public constructor(private readonly databaseClient: DatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<AuthorRawEntity> {
    const { input } = payload;

    const author = this.authorTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<AuthorRawEntity>(AuthorTable.name).insert(author, '*');

    const rawEntity = rawEntities[0] as AuthorRawEntity;

    return {
      ...rawEntity,
      isApproved: Boolean(rawEntity.isApproved),
    };
  }

  public async findById(payload: FindByIdPayload): Promise<AuthorRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<AuthorRawEntity>(AuthorTable.name).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return {
      ...rawEntity,
      isApproved: Boolean(rawEntity.isApproved),
    };
  }

  public async findByName(payload: FindByNamePayload): Promise<AuthorRawEntity | undefined> {
    const { name } = payload;

    const rawEntity = await this.databaseClient<AuthorRawEntity>(AuthorTable.name).select('*').where({ name }).first();

    if (!rawEntity) {
      return undefined;
    }

    return {
      ...rawEntity,
      isApproved: Boolean(rawEntity.isApproved),
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<AuthorRawEntity>(AuthorTable.name).truncate();
  }
}
