import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UserTokens } from '../../../domain/entities/userTokens/userTokens.js';
import { type EmailVerificationTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/emailVerificationTokenTable/emailVerificationTokenRawEntity.js';
import { EmailVerificationTokenTable } from '../../../infrastructure/databases/userDatabase/tables/emailVerificationTokenTable/emailVerificationTokenTable.js';
import { type RefreshTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';
import { RefreshTokenTable } from '../../../infrastructure/databases/userDatabase/tables/refreshTokenTable/refreshTokenTable.js';
import { type ResetPasswordTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/resetPasswordTokenTable/resetPasswordTokenRawEntity.js';
import { ResetPasswordTokenTable } from '../../../infrastructure/databases/userDatabase/tables/resetPasswordTokenTable/resetPasswordTokenTable.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { EmailVerificationTokenTestFactory } from '../../factories/emailVerificationTokenTestFactory/emailVerificationTokenTestFactory.js';
import { RefreshTokenTestFactory } from '../../factories/refreshTokenTestFactory/refreshTokenTestFactory.js';
import { ResetPasswordTokenTestFactory } from '../../factories/resetPasswordTokenTestFactory/resetPasswordTokenTestFactory.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<UserRawEntity>;
}

interface CreateAndPersistRefreshTokenPayload {
  input?: Partial<RefreshTokenRawEntity>;
}

interface CreateAndPersistEmailVerificationTokenPayload {
  input?: Partial<EmailVerificationTokenRawEntity>;
}

interface CreateAndPersistResetPasswordTokenPayload {
  input?: Partial<ResetPasswordTokenRawEntity>;
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

interface FindTokensByUserIdPayload {
  userId: string;
}

export class UserTestUtils {
  private readonly databaseTable = new UserTable();
  private readonly userTestFactory = new UserTestFactory();
  private readonly refreshTokenTable = new RefreshTokenTable();
  private readonly resetPasswordTokenTable = new ResetPasswordTokenTable();
  private readonly emailVerificationTokenTable = new EmailVerificationTokenTable();
  private readonly refreshTokenTestFactory = new RefreshTokenTestFactory();
  private readonly emailVerificationTokenTestFactory = new EmailVerificationTokenTestFactory();
  private readonly resetPasswordTokenTestFactory = new ResetPasswordTokenTestFactory();

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

  public async createAndPersistRefreshToken(
    payload: CreateAndPersistRefreshTokenPayload,
  ): Promise<RefreshTokenRawEntity> {
    const { input = {} } = payload;

    const refreshToken = this.refreshTokenTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: refreshToken.getId(),
        userId: refreshToken.getUserId(),
        token: refreshToken.getToken(),
        expiresAt: refreshToken.getExpiresAt(),
      },
      '*',
    );

    return rawEntities[0] as RefreshTokenRawEntity;
  }

  public async createAndPersistEmailVerificationToken(
    payload: CreateAndPersistEmailVerificationTokenPayload,
  ): Promise<EmailVerificationTokenRawEntity> {
    const { input = {} } = payload;

    const emailVerificationToken = this.emailVerificationTokenTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<EmailVerificationTokenRawEntity>(
      this.emailVerificationTokenTable.name,
    );

    const rawEntities = await queryBuilder.insert(
      {
        id: emailVerificationToken.getId(),
        userId: emailVerificationToken.getUserId(),
        token: emailVerificationToken.getToken(),
        expiresAt: emailVerificationToken.getExpiresAt(),
      },
      '*',
    );

    return rawEntities[0] as EmailVerificationTokenRawEntity;
  }

  public async createAndPersistResetPasswordToken(
    payload: CreateAndPersistResetPasswordTokenPayload,
  ): Promise<ResetPasswordTokenRawEntity> {
    const { input = {} } = payload;

    const resetPasswordToken = this.resetPasswordTokenTestFactory.create(input);

    const queryBuilder = this.sqliteDatabaseClient<ResetPasswordTokenRawEntity>(this.resetPasswordTokenTable.name);

    const rawEntities = await queryBuilder.insert(
      {
        id: resetPasswordToken.getId(),
        userId: resetPasswordToken.getUserId(),
        token: resetPasswordToken.getToken(),
        expiresAt: resetPasswordToken.getExpiresAt(),
      },
      '*',
    );

    return rawEntities[0] as ResetPasswordTokenRawEntity;
  }

  public async findTokensByUserId(payload: FindTokensByUserIdPayload): Promise<UserTokens> {
    const { userId } = payload;

    const [refreshTokens, resetPasswordToken, emailVerificationToken] = await Promise.all([
      this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name).select('*').where({ userId }),
      this.sqliteDatabaseClient<ResetPasswordTokenRawEntity>(this.resetPasswordTokenTable.name)
        .select('*')
        .where({ userId })
        .first(),
      this.sqliteDatabaseClient<EmailVerificationTokenRawEntity>(this.emailVerificationTokenTable.name)
        .select('*')
        .where({ userId })
        .first(),
    ]);

    return {
      refreshTokens: refreshTokens.map((refreshToken) => refreshToken.token),
      resetPasswordToken: resetPasswordToken?.token,
      emailVerificationToken: emailVerificationToken?.token,
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
