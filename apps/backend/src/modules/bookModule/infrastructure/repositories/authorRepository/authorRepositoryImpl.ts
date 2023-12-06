import { type AuthorMapper } from './authorMapper/authorMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Author } from '../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/authorTable/authorRawEntity.js';
import { AuthorTable } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/authorTable/authorTable.js';
import {
  type AuthorRepository,
  type CreateAuthorPayload,
  type FindAuthorPayload,
  type DeleteAuthorPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

export class AuthorRepositoryImpl implements AuthorRepository {
  private readonly databaseTable = new AuthorTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly authorMapper: AuthorMapper,
    private readonly uuidService: UuidService,
  ) {}

  private createQueryBuilder(): QueryBuilder<AuthorRawEntity> {
    return this.sqliteDatabaseClient<AuthorRawEntity>(this.databaseTable.name);
  }

  public async createAuthor(payload: CreateAuthorPayload): Promise<Author> {
    const { firstName, lastName } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: AuthorRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await queryBuilder.insert(
        {
          id,
          firstName,
          lastName,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as AuthorRawEntity;

    return this.authorMapper.mapToDomain(rawEntity);
  }

  public async findAuthor(payload: FindAuthorPayload): Promise<Author | null> {
    const { id, firstName, lastName } = payload;

    const queryBuilder = this.createQueryBuilder();

    let whereCondition: Partial<AuthorRawEntity> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (firstName) {
      whereCondition = {
        ...whereCondition,
        firstName,
      };
    }

    if (lastName) {
      whereCondition = {
        ...whereCondition,
        lastName,
      };
    }

    let rawEntity: AuthorRawEntity | undefined;

    try {
      rawEntity = await queryBuilder.select('*').where(whereCondition).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.authorMapper.mapToDomain(rawEntity);
  }

  public async deleteAuthor(payload: DeleteAuthorPayload): Promise<void> {
    const { id } = payload;

    const existingAuthor = await this.findAuthor({ id });

    if (!existingAuthor) {
      throw new ResourceNotFoundError({
        name: 'Author',
        id,
      });
    }

    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'delete',
      });
    }
  }
}
