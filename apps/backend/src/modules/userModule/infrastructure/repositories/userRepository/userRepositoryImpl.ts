import { type UserMapper } from './userMapper/userMapper.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { User, type UserState } from '../../../domain/entities/user/user.js';
import {
  type UserRepository,
  type SaveUserPayload,
  type FindUserPayload,
  type DeleteUserPayload,
  type FindUsersPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserRawEntity } from '../../databases/userDatabase/tables/userTable/userRawEntity.js';
import { userTable } from '../../databases/userDatabase/tables/userTable/userTable.js';

type CreateUserPayload = { user: UserState };

type UpdateUserPayload = { user: User };

export class UserRepositoryImpl implements UserRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly userMapper: UserMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveUser(payload: SaveUserPayload): Promise<User> {
    const { user } = payload;

    if (user instanceof User) {
      return this.updateUser({ user });
    }

    return this.createUser({ user });
  }

  private async createUser(payload: CreateUserPayload): Promise<User> {
    const {
      user: { email, password, name, isEmailVerified, role },
    } = payload;

    let rawEntities: UserRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await this.databaseClient<UserRawEntity>(userTable).insert(
        {
          id,
          email,
          password,
          name,
          isEmailVerified,
          role,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'create',
        error,
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  private async updateUser(payload: UpdateUserPayload): Promise<User> {
    const { user } = payload;

    let rawEntities: UserRawEntity[] = [];

    try {
      rawEntities = await this.databaseClient<UserRawEntity>(userTable)
        .update(user.getState(), '*')
        .where({ id: user.getId() });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
        error,
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
      rawEntity = await this.databaseClient<UserRawEntity>(userTable).select('*').where(whereCondition).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userMapper.mapToDomain(rawEntity);
  }

  public async findUsers(payload: FindUsersPayload): Promise<User[]> {
    const { page, pageSize } = payload;

    let rawEntities: UserRawEntity[];

    try {
      rawEntities = await this.databaseClient<UserRawEntity>(userTable)
        .select('*')
        .limit(pageSize)
        .offset((page - 1) * pageSize);
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.userMapper.mapToDomain(rawEntity));
  }

  public async countUsers(): Promise<number> {
    try {
      const query = this.databaseClient<UserRawEntity>(userTable);

      const countResult = await query.count().first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'User',
          operation: 'count',
          countResult,
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'count',
        error,
      });
    }
  }

  public async deleteUser(payload: DeleteUserPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<UserRawEntity>(userTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
        error,
      });
    }
  }
}
