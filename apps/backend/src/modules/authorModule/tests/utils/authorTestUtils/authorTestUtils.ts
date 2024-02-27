import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/tables/authorTable/authorRawEntity.js';
import { AuthorTable } from '../../../infrastructure/databases/tables/authorTable/authorTable.js';
import { AuthorTestFactory } from '../../factories/authorTestFactory/authorTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<AuthorRawEntity>;
}

interface PersistPayload {
  readonly author: AuthorRawEntity;
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByNamePayload {
  readonly firstName: string;
  readonly lastName: string;
}

export class AuthorTestUtils {
  private readonly databaseTable = new AuthorTable();
  private readonly authorTestFactory = new AuthorTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<AuthorRawEntity> {
    const { input } = payload;

    const author = this.authorTestFactory.createRaw(input);

    const rawEntities = await this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name).insert(author, '*');

    return rawEntities[0] as AuthorRawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { author } = payload;

    await this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name).insert(author);
  }

  public async findById(payload: FindByIdPayload): Promise<AuthorRawEntity> {
    const { id } = payload;

    const authorRawEntity = await this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name)
      .select('*')
      .where({ id })
      .first();

    return authorRawEntity as AuthorRawEntity;
  }

  public async findByName(payload: FindByNamePayload): Promise<AuthorRawEntity> {
    const { firstName, lastName } = payload;

    const authorRawEntity = await this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name)
      .select('*')
      .where({
        firstName,
        lastName,
      })
      .first();

    return authorRawEntity as AuthorRawEntity;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name).truncate();
  }
}
