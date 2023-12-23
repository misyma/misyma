import { type UserMapper } from './userMapper/userMapper.js';
import { type UserTokensMapper } from './userTokensMapper/userTokensMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
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
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable/userTable.js';
import { type UserTokensRawEntity } from '../../databases/userDatabase/tables/userTokensTable/userTokensRawEntity.js';
import { UserTokensTable } from '../../databases/userDatabase/tables/userTokensTable/userTokensTable.js';

// I am quite certain it was a builtin type, but couldn't find it...
type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export interface MappedUserUpdate {
  userUpdatePayload: Partial<UserRawEntity>;
  userTokensUpdatePayload?: Partial<UserTokensRawEntity> | undefined;
}

export class UserRepositoryImpl implements UserRepository {
  private readonly databaseTable = new UserTable();

  private readonly userTokensTable = new UserTokensTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly userTokensMapper: UserTokensMapper,
    private readonly uuidService: UuidService,
  ) {}

  private createQueryBuilder(): QueryBuilder<UserRawEntity> {
    return this.sqliteDatabaseClient<UserRawEntity>(this.databaseTable.name);
  }

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const { email, password, firstName, lastName } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: UserRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await queryBuilder.insert(
        {
          id,
          email,
          password,
          firstName,
          lastName,
        },
        '*',
      );
    } catch (error) {
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

    const queryBuilder = this.createQueryBuilder();

    let whereCondition: Partial<UserRawEntity> = {};

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
      rawEntity = await queryBuilder.select('*').where(whereCondition).first();
    } catch (error) {
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

    let rawEntity: UserTokensRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<UserTokensRawEntity>(this.userTokensTable.name)
        .select('*')
        .where({ userId })
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserTokens',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userTokensMapper.mapToDomain(rawEntity);
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

    const { userUpdatePayload, userTokensUpdatePayload } = this.mapDomainActionsToUpdatePayload(domainActions);

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        rawEntities = await transaction.update(userUpdatePayload, '*').table(this.databaseTable.name).where({ id });

        if (userTokensUpdatePayload) {
          await transaction.update(userTokensUpdatePayload).table(this.userTokensTable.name).where({ userId: id });
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  private mapDomainActionsToUpdatePayload(domainActions: UserDomainAction[]): MappedUserUpdate {
    let user: Partial<Writeable<UserRawEntity>> = {};

    let userTokens: Partial<UserTokensRawEntity> | undefined = undefined;

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
        case UserDomainActionType.updatePassword:
          user = {
            ...user,
            password: domainAction.payload.newPassword,
          };

          break;

        case UserDomainActionType.resetPassword:
          userTokens = {
            resetPasswordToken: domainAction.payload.resetPasswordToken,
          };

          break;

        case UserDomainActionType.updateEmail:
          user.email = domainAction.payload.newEmail;

          break;

        case UserDomainActionType.updateFirstName:
          user.firstName = domainAction.payload.firstName;

          break;

        case UserDomainActionType.updateLastName:
          user.lastName = domainAction.payload.lastName;

          break;

        default:
          throw new RepositoryError({
            entity: 'User',
            operation: 'update',
          });
      }
    });

    return {
      userUpdatePayload: user,
      userTokensUpdatePayload: userTokens,
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

    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
      });
    }
  }
}
