import { type UserMapper } from './userMapper/userMapper.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type Writeable } from '../../../../../common/types/util/writeable.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type UserDomainAction } from '../../../domain/entities/user/domainActions/userDomainAction.js';
import { UserDomainActionType } from '../../../domain/entities/user/domainActions/userDomainActionType.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type UserTokens } from '../../../domain/entities/userTokens/userTokens.js';
import {
  type UserRepository,
  type CreateUserPayload,
  type FindUserPayload,
  type UpdateUserPayload,
  type DeleteUserPayload,
  type FindUserTokensPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';
import { type EmailVerificationTokenRawEntity } from '../../databases/userDatabase/tables/emailVerificationTokenTable/emailVerificationTokenRawEntity.js';
import { EmailVerificationTokenTable } from '../../databases/userDatabase/tables/emailVerificationTokenTable/emailVerificationTokenTable.js';
import { type RefreshTokenRawEntity } from '../../databases/userDatabase/tables/refreshTokenTable/refreshTokenRawEntity.js';
import { RefreshTokenTable } from '../../databases/userDatabase/tables/refreshTokenTable/refreshTokenTable.js';
import { type ResetPasswordTokenRawEntity } from '../../databases/userDatabase/tables/resetPasswordTokenTable/resetPasswordTokenRawEntity.js';
import { ResetPasswordTokenTable } from '../../databases/userDatabase/tables/resetPasswordTokenTable/resetPasswordTokenTable.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable/userTable.js';

interface TokenValue {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface MappedUserUpdate {
  readonly userUpdatePayload: Partial<UserRawEntity> | undefined;
  readonly refreshTokenCreatePayloads: TokenValue[];
  readonly resetPasswordTokenUpdatePayload?: TokenValue | undefined;
  readonly emailVerificationTokenUpdatePayload?: TokenValue | undefined;
}

export interface FindRefreshTokensPayload {
  readonly userId: string;
}

export interface FindResetPasswordTokenPayload {
  readonly userId: string;
}

export interface FindEmailVerificationTokenPayload {
  readonly userId: string;
}

export class UserRepositoryImpl implements UserRepository {
  private readonly userDatabaseTable = new UserTable();

  private readonly refreshTokenTable = new RefreshTokenTable();
  private readonly resetPasswordTokenTable = new ResetPasswordTokenTable();
  private readonly emailVerificationTokenTable = new EmailVerificationTokenTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const { email, password, firstName, lastName, isEmailVerified } = payload;

    let rawEntities: UserRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await this.sqliteDatabaseClient<UserRawEntity>(this.userDatabaseTable.name).insert(
        {
          id,
          email,
          password,
          firstName,
          lastName,
          isEmailVerified,
        },
        '*',
      );
    } catch (error) {
      this.loggerService.error({
        message: 'Error while creating User.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  public async findUser(payload: FindUserPayload): Promise<User | null> {
    const { id, email } = payload;

    let whereCondition: Partial<UserRawEntity> = {};

    if (!id && !email) {
      throw new OperationNotValidError({
        reason: 'Either id or email must be provided.',
      });
    }

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (email) {
      whereCondition = {
        ...whereCondition,
        email,
      };
    }

    let rawEntity: UserRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<UserRawEntity>(this.userDatabaseTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding User.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userMapper.mapToDomain(rawEntity);
  }

  public async findUserTokens(payload: FindUserTokensPayload): Promise<UserTokens | null> {
    const { userId } = payload;

    const [refreshTokens, resetPasswordToken, emailVerificationToken] = await Promise.all([
      this.findRefreshTokens({ userId }),
      this.findResetPasswordToken({ userId }),
      this.findEmailVerificationToken({ userId }),
    ]);

    if (!refreshTokens.length && !resetPasswordToken && !emailVerificationToken) {
      return null;
    }

    return {
      refreshTokens: refreshTokens.map((refreshToken) => refreshToken.token),
      resetPasswordToken: resetPasswordToken?.token,
      emailVerificationToken: emailVerificationToken?.token,
    };
  }

  private async findRefreshTokens(payload: FindRefreshTokensPayload): Promise<RefreshTokenRawEntity[]> {
    const { userId } = payload;

    let rawEntities: RefreshTokenRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<RefreshTokenRawEntity>(this.refreshTokenTable.name)
        .select('*')
        .where({ userId });
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding RefreshToken.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'RefreshToken',
        operation: 'find',
      });
    }

    return rawEntities;
  }

  private async findResetPasswordToken(
    payload: FindResetPasswordTokenPayload,
  ): Promise<ResetPasswordTokenRawEntity | undefined> {
    const { userId } = payload;

    let rawEntity: ResetPasswordTokenRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<ResetPasswordTokenRawEntity>(this.resetPasswordTokenTable.name)
        .select('*')
        .where({ userId })
        .first();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding ResetPasswordToken.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'ResetPasswordToken',
        operation: 'find',
      });
    }

    return rawEntity;
  }

  private async findEmailVerificationToken(
    payload: FindEmailVerificationTokenPayload,
  ): Promise<EmailVerificationTokenRawEntity | undefined> {
    const { userId } = payload;

    let rawEntity: EmailVerificationTokenRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<EmailVerificationTokenRawEntity>(
        this.emailVerificationTokenTable.name,
      )
        .select('*')
        .where({ userId })
        .first();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding EmailVerificationToken.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'EmailVerificationToken',
        operation: 'find',
      });
    }

    return rawEntity;
  }

  public async updateUser(payload: UpdateUserPayload): Promise<User> {
    const { id, domainActions } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id,
      });
    }

    let rawEntities: UserRawEntity[] = [];

    const {
      userUpdatePayload,
      refreshTokenCreatePayloads,
      emailVerificationTokenUpdatePayload,
      resetPasswordTokenUpdatePayload,
    } = this.mapDomainActionsToUpdatePayload(domainActions);

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        if (userUpdatePayload) {
          rawEntities = await transaction<UserRawEntity>(this.userDatabaseTable.name)
            .update(userUpdatePayload, '*')
            .where({ id });
        }

        if (refreshTokenCreatePayloads.length) {
          await transaction<RefreshTokenRawEntity>(this.refreshTokenTable.name).insert(
            refreshTokenCreatePayloads.map((refreshTokenCreatePayload) => ({
              id: this.uuidService.generateUuid(),
              userId: id,
              ...refreshTokenCreatePayload,
            })),
          );
        }

        if (resetPasswordTokenUpdatePayload) {
          await transaction<ResetPasswordTokenRawEntity>(this.resetPasswordTokenTable.name)
            .insert({
              id: this.uuidService.generateUuid(),
              userId: id,
              ...resetPasswordTokenUpdatePayload,
            })
            .onConflict(this.resetPasswordTokenTable.columns.userId)
            .merge({
              ...resetPasswordTokenUpdatePayload,
            });
        }

        if (emailVerificationTokenUpdatePayload) {
          await transaction<EmailVerificationTokenRawEntity>(this.emailVerificationTokenTable.name)
            .insert({
              id: this.uuidService.generateUuid(),
              userId: id,
              ...emailVerificationTokenUpdatePayload,
            })
            .onConflict(this.emailVerificationTokenTable.columns.userId)
            .merge({
              ...emailVerificationTokenUpdatePayload,
            });
        }
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error while updating User.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
      });
    }

    if (!rawEntities.length) {
      return existingUser;
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  private mapDomainActionsToUpdatePayload(domainActions: UserDomainAction[]): MappedUserUpdate {
    let user: Partial<Writeable<UserRawEntity>> | undefined = undefined;

    const refreshTokenCreatePayloads: TokenValue[] = [];

    let resetPasswordTokenUpdatePayload: TokenValue | undefined = undefined;

    let emailVerificationTokenUpdatePayload: TokenValue | undefined = undefined;

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
        case UserDomainActionType.createRefreshToken:
          refreshTokenCreatePayloads.push({
            token: domainAction.payload.token,
            expiresAt: domainAction.payload.expiresAt,
          });

          break;

        case UserDomainActionType.updateResetPasswordToken:
          resetPasswordTokenUpdatePayload = {
            token: domainAction.payload.token,
            expiresAt: domainAction.payload.expiresAt,
          };

          break;

        case UserDomainActionType.updateEmailVerificationToken:
          emailVerificationTokenUpdatePayload = {
            token: domainAction.payload.token,
            expiresAt: domainAction.payload.expiresAt,
          };

          break;

        case UserDomainActionType.updateEmail:
          user = {
            ...(user || {}),
            email: domainAction.payload.newEmail,
          };

          break;

        case UserDomainActionType.updatePassword:
          user = {
            ...(user || {}),
            password: domainAction.payload.newPassword,
          };

          break;

        case UserDomainActionType.updateFirstName:
          user = {
            ...(user || {}),
            firstName: domainAction.payload.firstName,
          };

          break;

        case UserDomainActionType.updateLastName:
          user = {
            ...(user || {}),
            lastName: domainAction.payload.lastName,
          };

          break;

        case UserDomainActionType.verifyEmail:
          user = {
            ...(user || {}),
            isEmailVerified: true,
          };

          break;

        default:
          this.loggerService.error({
            message: 'Error mapping domain actions.',
          });

          throw new RepositoryError({
            entity: 'User',
            operation: 'update',
          });
      }
    });

    return {
      userUpdatePayload: user,
      refreshTokenCreatePayloads,
      resetPasswordTokenUpdatePayload,
      emailVerificationTokenUpdatePayload,
    };
  }

  public async deleteUser(payload: DeleteUserPayload): Promise<void> {
    const { id } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id,
      });
    }

    try {
      await this.sqliteDatabaseClient<UserRawEntity>(this.userDatabaseTable.name).delete().where({ id });
    } catch (error) {
      this.loggerService.error({
        message: 'Error while deleting User.',
        context: { error },
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
      });
    }
  }
}
