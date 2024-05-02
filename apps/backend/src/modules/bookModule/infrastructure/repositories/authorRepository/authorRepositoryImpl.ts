import { type AuthorMapper } from './authorMapper/authorMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Author } from '../../../../bookModule/domain/entities/author/author.js';
import {
  type AuthorRepository,
  type CreateAuthorPayload,
  type FindAuthorPayload,
  type DeleteAuthorPayload,
  type FindAuthorsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type AuthorRawEntity } from '../../databases/bookDatabase/tables/authorTable/authorRawEntity.js';
import { AuthorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';

export class AuthorRepositoryImpl implements AuthorRepository {
  private readonly databaseTable = new AuthorTable();

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly authorMapper: AuthorMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async createAuthor(payload: CreateAuthorPayload): Promise<Author> {
    const { name, isApproved } = payload;

    let rawEntities: AuthorRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await this.databaseClient<AuthorRawEntity>(this.databaseTable.name).insert(
        {
          id,
          name,
          isApproved,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'create',
        error,
      });
    }

    const rawEntity = rawEntities[0] as AuthorRawEntity;

    return this.authorMapper.mapToDomain(rawEntity);
  }

  public async findAuthor(payload: FindAuthorPayload): Promise<Author | null> {
    const { id, name } = payload;

    let whereCondition: Partial<AuthorRawEntity> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (name) {
      whereCondition = {
        ...whereCondition,
        name,
      };
    }

    let rawEntity: AuthorRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<AuthorRawEntity>(this.databaseTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.authorMapper.mapToDomain(rawEntity);
  }

  public async findAuthors(payload: FindAuthorsPayload): Promise<Author[]> {
    const { ids, name, isApproved, page, pageSize } = payload;

    let rawEntities: AuthorRawEntity[];

    try {
      const query = this.databaseClient<AuthorRawEntity>(this.databaseTable.name).select('*');

      if (ids) {
        query.whereIn('id', ids);
      }

      if (name) {
        query.whereRaw('LOWER(name) LIKE LOWER(?)', `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where({ isApproved });
      }

      rawEntities = await query.limit(pageSize).offset((page - 1) * pageSize);
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.authorMapper.mapToDomain(rawEntity));
  }

  public async deleteAuthor(payload: DeleteAuthorPayload): Promise<void> {
    const { id } = payload;

    const existingAuthor = await this.findAuthor({ id });

    if (!existingAuthor) {
      throw new ResourceNotFoundError({
        resource: 'Author',
        id,
      });
    }

    try {
      await this.databaseClient<AuthorRawEntity>(this.databaseTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'delete',
        error,
      });
    }
  }

  public async countAuthors(payload: FindAuthorsPayload): Promise<number> {
    const { ids, name, isApproved } = payload;

    try {
      const query = this.databaseClient<AuthorRawEntity>(this.databaseTable.name);

      if (ids) {
        query.whereIn('id', ids);
      }

      if (name) {
        query.whereRaw('LOWER(name) LIKE LOWER(?)', `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where({ isApproved });
      }

      const countResult = await query.count().first();

      const count = countResult?.['count(*)'];

      if (count === undefined) {
        throw new ResourceNotFoundError({
          resource: 'Author',
          operation: 'count',
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'count',
        error,
      });
    }
  }
}
