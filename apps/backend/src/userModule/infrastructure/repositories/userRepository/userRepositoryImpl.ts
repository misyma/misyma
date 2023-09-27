import { type UserMapper } from './userMapper/userMapper.js';
import { RepositoryError } from '../../../../common/validation/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../common/validation/errors/common/resourceNotFoundError.js';
import { type PostgresDatabaseClient } from '../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { type QueryBuilder } from '../../../../libs/database/types/queryBuilder.js';
import {
  type UserRepository,
  type CreateUserPayload,
  type FindUserPayload,
  type UpdateUserPayload,
  type DeleteUserPayload,
} from '../../../application/repositories/userRepository/userRepository.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userRawEntity.js';
import { UserTable } from '../../databases/userDatabase/tables/userTable.js';

export class UserRepositoryImpl implements UserRepository {
  private readonly databaseTable = new UserTable();

  public constructor(
    private readonly postgresDatabaseClient: PostgresDatabaseClient,
    private readonly userMapper: UserMapper,
  ) {}

  private createQueryBuilder(): QueryBuilder<UserRawEntity> {
    return this.postgresDatabaseClient<UserRawEntity>(this.databaseTable.name);
  }

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const { id, email, password } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: UserRawEntity[];

    try {
      rawEntities = await queryBuilder.insert(
        {
          id,
          email,
          password,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'user',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.map(rawEntity);
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
        entity: 'user',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userMapper.map(rawEntity);
  }

  public async updateUser(payload: UpdateUserPayload): Promise<User> {
    const { id, password } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'user',
        id,
      });
    }

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: UserRawEntity[];

    try {
      rawEntities = await queryBuilder.update({ password }, '*').where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'user',
        operation: 'update',
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.map(rawEntity);
  }

  public async deleteUser(payload: DeleteUserPayload): Promise<void> {
    const { id } = payload;

    const existingUser = await this.findUser({ id });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'user',
        id,
      });
    }

    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'user',
        operation: 'delete',
      });
    }
  }
}
