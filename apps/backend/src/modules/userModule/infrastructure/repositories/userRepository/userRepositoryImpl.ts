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
import {
  type UserRepository,
  type CreateUserPayload,
  type FindUserPayload,
  type UpdateUserPayload,
  type DeleteUserPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable/userTable.js';

export interface MappedUserUpdate {
  readonly userUpdatePayload: Partial<UserRawEntity> | undefined;
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

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const { email, password, name, isEmailVerified } = payload;

    let rawEntities: UserRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await this.sqliteDatabaseClient<UserRawEntity>(this.userDatabaseTable.name).insert(
        {
          id,
          email,
          password,
          name,
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

    const { userUpdatePayload } = this.mapDomainActionsToUpdatePayload(domainActions);

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        if (userUpdatePayload) {
          rawEntities = await transaction<UserRawEntity>(this.userDatabaseTable.name)
            .update(userUpdatePayload, '*')
            .where({ id });
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

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
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

        case UserDomainActionType.updateName:
          user = {
            ...(user || {}),
            name: domainAction.payload.name,
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
            context: {
              domainAction,
            },
          });

          throw new RepositoryError({
            entity: 'User',
            operation: 'update',
          });
      }
    });

    return {
      userUpdatePayload: user,
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
