import { type AuthorMapper } from './authorMapper/authorMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Author } from '../../../domain/entities/author/author.js';
import {
  type AuthorRepository,
  type CreateAuthorPayload,
  type FindAuthorPayload,
  type DeleteAuthorPayload,
  type FindAuthorsByIdsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type AuthorRawEntity } from '../../databases/tables/authorTable/authorRawEntity.js';
import { AuthorTable } from '../../databases/tables/authorTable/authorTable.js';

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

  public async findAuthorsByIds(payload: FindAuthorsByIdsPayload): Promise<Author[]> {
    const { authorIds } = payload;

    let rawEntities: AuthorRawEntity[];

    try {
      rawEntities = await this.databaseClient<AuthorRawEntity>(this.databaseTable.name)
        .select('*')
        .whereIn('id', authorIds);
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
}
