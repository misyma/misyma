import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/tables/authorTable/authorRawEntity.js';
import { AuthorTable } from '../../../infrastructure/databases/tables/authorTable/authorTable.js';
import { AuthorTestFactory } from '../../factories/authorTestFactory/authorTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<AuthorRawEntity>;
}

interface PersistPayload {
  author: AuthorRawEntity;
}

interface FindByIdPayload {
  id: string;
}

interface FindByNamePayload {
  firstName: string;
  lastName: string;
}

export class AuthorTestUtils {
  private readonly databaseTable = new AuthorTable();
  private readonly authorTestFactory = new AuthorTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<AuthorRawEntity> {
    return this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<AuthorRawEntity> {
    const { input } = payload;

    const author = this.authorTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(author, '*');

    return rawEntities[0] as AuthorRawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { author } = payload;

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(author);
  }

  public async findById(payload: FindByIdPayload): Promise<AuthorRawEntity> {
    const { id } = payload;

    const queryBuilder = this.createQueryBuilder();

    const authorRawEntity = await queryBuilder.select('*').where({ id }).first();

    return authorRawEntity as AuthorRawEntity;
  }

  public async findByName(payload: FindByNamePayload): Promise<AuthorRawEntity> {
    const { firstName, lastName } = payload;

    const queryBuilder = this.createQueryBuilder();

    const authorRawEntity = await queryBuilder
      .select('*')
      .where({
        firstName,
        lastName,
      })
      .first();

    return authorRawEntity as AuthorRawEntity;
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
