import { type UserMapper } from './userMapper/userMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
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

export class UserRepositoryImpl implements UserRepository {
  private readonly databaseTable = new UserTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly userMapper: UserMapper,
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

  public async updateUser(payload: UpdateUserPayload): Promise<User> {
    const { id, password, firstName, lastName } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id,
      });
    }

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: UserRawEntity[];

    let updatePayload: Partial<UserRawEntity> = {};

    if (password) {
      updatePayload = {
        ...updatePayload,
        password,
      };
    }

    if (firstName) {
      updatePayload = {
        ...updatePayload,
        firstName,
      };
    }

    if (lastName) {
      updatePayload = {
        ...updatePayload,
        lastName,
      };
    }

    try {
      rawEntities = await queryBuilder.update(updatePayload, '*').where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
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
