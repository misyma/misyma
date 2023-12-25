import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { type UserTokensRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';
import { UserTokensTable } from '../../../infrastructure/databases/userDatabase/tables/userTokensTable/userTokensTable.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';
import { UserTokensTestFactory } from '../../factories/userTokensTestFactory/userTokensTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<UserRawEntity>;
}

interface CreateAndPersistUserTokensPayload {
  input?: Partial<UserTokensRawEntity>;
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
  private readonly userTokensTable = new UserTokensTable();
  private readonly userTestFactory = new UserTestFactory();
  private readonly userTokensTestFactory = new UserTokensTestFactory();

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
        email: user.getEmail(),
        firstName: user.getFirstName(),
        id: user.getId(),
        lastName: user.getLastName(),
        password: user.getPassword(),
        isEmailVerified: user.getIsEmailVerified(),
      },
      '*',
    );

    return rawEntities[0] as UserRawEntity;
  }

  public async createAndPersistUserTokens(payload: CreateAndPersistUserTokensPayload): Promise<UserTokensRawEntity> {
    const { input = {} } = payload;

    const userTokens = this.userTokensTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<UserTokensRawEntity>(this.userTokensTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: userTokens.getId(),
        userId: userTokens.getUserId(),
        refreshToken: userTokens.getRefreshToken(),
        resetPasswordToken: userTokens.getResetPasswordToken() as string,
        emailVerificationToken: userTokens.getEmailVerificationToken() as string,
      },
      '*',
    );

    return rawEntities[0] as UserTokensRawEntity;
  }

  public async findUserTokensByUserId(payload: FindByIdPayload): Promise<UserTokensRawEntity> {
    const { id } = payload;

    const queryBuilder = this.sqliteDatabaseClient<UserTokensRawEntity>(this.userTokensTable.name);

    const rawEntities = await queryBuilder.select('*').where({ userId: id });

    return rawEntities[0] as UserTokensRawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(user, '*');
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity> {
    const { email } = payload;

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ email }).first();

    return userRawEntity as UserRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity> {
    const { id } = payload;

    const queryBuilder = this.createQueryBuilder();

    const userRawEntity = await queryBuilder.select('*').where({ id }).first();

    return userRawEntity as UserRawEntity;
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
