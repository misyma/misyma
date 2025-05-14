import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type AuthorState, Author } from '../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorRawEntity.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorsTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/booksAuthorsTable/booksAuthorsTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelvesTable.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/usersBooksTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import {
  type AuthorRepository,
  type SaveAuthorPayload,
  type FindAuthorPayload,
  type DeleteAuthorPayload,
  type FindAuthorsPayload,
  type CountAuthorsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

import { type AuthorMapper } from './authorMapper/authorMapper.js';

type CreateAuthorPayload = { author: AuthorState };

type UpdateAuthorPayload = { author: Author };

export class AuthorRepositoryImpl implements AuthorRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly authorMapper: AuthorMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveAuthor(payload: SaveAuthorPayload): Promise<Author> {
    const { author } = payload;

    if (author instanceof Author) {
      return this.update({ author });
    }

    return this.create({ author });
  }

  private async create(entity: CreateAuthorPayload): Promise<Author> {
    const { author } = entity;

    let rawEntity: AuthorRawEntity;

    try {
      const result = await this.databaseClient<AuthorRawEntity>(authorsTable.name).insert(
        {
          id: this.uuidService.generateUuid(),
          name: author.name,
          is_approved: author.isApproved,
        },
        '*',
      );

      rawEntity = result[0] as AuthorRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'create',
        originalError: error,
      });
    }

    return this.authorMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateAuthorPayload): Promise<Author> {
    const { author } = payload;

    let rawEntity: AuthorRawEntity;

    try {
      const { name, isApproved } = author.getState();

      const result = await this.databaseClient<AuthorRawEntity>(authorsTable.name)
        .where({ id: author.getId() })
        .update({ name, is_approved: isApproved }, '*');

      rawEntity = result[0] as AuthorRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'update',
        originalError: error,
      });
    }

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
      rawEntity = await this.databaseClient<AuthorRawEntity>(authorsTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.authorMapper.mapToDomain(rawEntity);
  }

  public async findAuthors(payload: FindAuthorsPayload): Promise<Author[]> {
    const { ids, name, isApproved, userId, bookshelfId, page, pageSize, sortField, sortOrder } = payload;

    let rawEntities: AuthorRawEntity[];

    try {
      const query = this.databaseClient(authorsTable.name).select([authorsTable.allColumns]).distinct();

      if (userId || bookshelfId) {
        query
          .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.author_id, authorsTable.columns.id)
          .leftJoin(usersBooksTable.name, usersBooksTable.columns.book_id, booksAuthorsTable.columns.book_id)
          .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id);

        if (userId) {
          query.where(bookshelvesTable.columns.user_id, userId);
        }

        if (bookshelfId) {
          query.where(bookshelvesTable.columns.id, bookshelfId);
        }
      }

      if (ids) {
        query.whereIn(authorsTable.columns.id, ids);
      }

      if (name) {
        query.whereRaw(`${authorsTable.columns.name} ILIKE ?`, `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where(authorsTable.columns.is_approved, isApproved);
      }

      if (sortField === 'name') {
        query.orderBy(authorsTable.columns.name, sortOrder ?? 'asc');
      } else {
        query.orderBy(authorsTable.columns.id, sortOrder ?? 'desc');
      }

      rawEntities = await query.limit(pageSize).offset((page - 1) * pageSize);
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.authorMapper.mapToDomain(rawEntity));
  }

  public async deleteAuthor(payload: DeleteAuthorPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<AuthorRawEntity>(authorsTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countAuthors(payload: CountAuthorsPayload): Promise<number> {
    const { ids, name, userId, bookshelfId, isApproved } = payload;

    try {
      const query = this.databaseClient<AuthorRawEntity>(authorsTable.name);

      if (userId || bookshelfId) {
        query
          .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.author_id, authorsTable.columns.id)
          .leftJoin(usersBooksTable.name, usersBooksTable.columns.book_id, booksAuthorsTable.columns.book_id)
          .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id);

        if (userId) {
          query.where(bookshelvesTable.columns.user_id, userId);
        }

        if (bookshelfId) {
          query.where(bookshelvesTable.columns.id, bookshelfId);
        }
      }

      if (ids) {
        query.whereIn(authorsTable.columns.id, ids);
      }

      if (name) {
        query.whereRaw(`${authorsTable.columns.name} ILIKE ?`, `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where(authorsTable.columns.is_approved, isApproved);
      }

      const countResult = (await query.countDistinct(`${authorsTable.columns.id} as count`).first()) as
        | { count: string }
        | undefined;

      const count = countResult?.count;

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Author',
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
        entity: 'Author',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
