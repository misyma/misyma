import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<UserRawEntity>;
}

interface PersistPayload {
  user: UserRawEntity;
}

interface FindByEmailPayload {
  email: string;
}

interface FindByIdPayload {
  id: string;
}

export class UserTestUtils {
  private readonly databaseTable = new UserTable();
  private readonly userTestFactory = new UserTestFactory();

  public constructor(private readonly postgresDatabaseClient: PostgresDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<UserRawEntity> {
    return this.postgresDatabaseClient<UserRawEntity>(this.databaseTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(user, '*');

    return rawEntities[0] as UserRawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(user);
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity | undefined> {
    const { email } = payload;

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ email }).first();

    return userRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity | undefined> {
    const { id } = payload;

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ id }).first();

    return userRawEntity;
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
