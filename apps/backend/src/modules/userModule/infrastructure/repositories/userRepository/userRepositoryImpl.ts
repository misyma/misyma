import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type UserRawEntity } from '../../../../databaseModule/infrastructure/tables/userTable/userRawEntity.js';
import { usersTable } from '../../../../databaseModule/infrastructure/tables/userTable/userTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { User, type UserState } from '../../../domain/entities/user/user.js';
import {
  type UserRepository,
  type SaveUserPayload,
  type FindUserPayload,
  type DeleteUserPayload,
  type FindUsersPayload,
} from '../../../domain/repositories/userRepository/userRepository.js';

import { type UserMapper } from './userMapper/userMapper.js';

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
      rawEntities = await this.databaseClient<UserRawEntity>(usersTable).insert(
        {
          id,
          email,
          password,
          name,
          is_email_verified: isEmailVerified,
          role,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'create',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as UserRawEntity;

    return this.userMapper.mapToDomain(rawEntity);
  }

  private async updateUser(payload: UpdateUserPayload): Promise<User> {
    const { user } = payload;

    let rawEntities: UserRawEntity[] = [];

    try {
      const { name, email, password, isEmailVerified } = user.getState();

      rawEntities = await this.databaseClient<UserRawEntity>(usersTable)
        .update(
          {
            is_email_verified: isEmailVerified,
            email,
            password,
            name,
          },
          '*',
        )
        .where({ id: user.getId() });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'update',
        originalError: error,
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
      rawEntity = await this.databaseClient<UserRawEntity>(usersTable).select('*').where(whereCondition).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
        originalError: error,
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
      rawEntities = await this.databaseClient<UserRawEntity>(usersTable)
        .select('*')
        .limit(pageSize)
        .offset((page - 1) * pageSize);
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.userMapper.mapToDomain(rawEntity));
  }

  public async countUsers(): Promise<number> {
    try {
      const query = this.databaseClient<UserRawEntity>(usersTable);

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
        originalError: error,
      });
    }
  }

  public async deleteUser(payload: DeleteUserPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<UserRawEntity>(usersTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'User',
        operation: 'delete',
        originalError: error,
      });
    }
  }
}
