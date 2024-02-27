import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
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

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<UserRawEntity> {
    return this.sqliteDatabaseClient<UserRawEntity>(this.databaseTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
      {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        password: user.getPassword(),
        isEmailVerified: user.getIsEmailVerified(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as UserRawEntity;

    return {
      ...rawEntity,
      isEmailVerified: Boolean(rawEntity.isEmailVerified),
    };
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(user, '*');
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity | undefined> {
    const { email: emailInput } = payload;

    const email = emailInput.toLowerCase();

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ email }).first();

    if (!userRawEntity) {
      return undefined;
    }

    return {
      ...userRawEntity,
      isEmailVerified: Boolean(userRawEntity.isEmailVerified),
    };
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity | undefined> {
    const { id } = payload;

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ id }).first();

    if (!userRawEntity) {
      return undefined;
    }

    return {
      ...userRawEntity,
      isEmailVerified: Boolean(userRawEntity.isEmailVerified),
    };
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
