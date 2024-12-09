import { type AuthorMapper } from './authorMapper/authorMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type AuthorState, Author } from '../../../../bookModule/domain/entities/author/author.js';
import { bookshelfTable } from '../../../../bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import {
  type AuthorRepository,
  type SaveAuthorPayload,
  type FindAuthorPayload,
  type DeleteAuthorPayload,
  type FindAuthorsPayload,
  type CountAuthorsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type AuthorRawEntity } from '../../databases/bookDatabase/tables/authorTable/authorRawEntity.js';
import { authorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import { bookAuthorTable } from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import { userBookTable } from '../../databases/bookDatabase/tables/userBookTable/userBookTable.js';

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
      const result = await this.databaseClient<AuthorRawEntity>(authorTable).insert(
        {
          id: this.uuidService.generateUuid(),
          name: author.name,
          isApproved: author.isApproved,
          createdAt: author.createdAt,
        },
        '*',
      );

      rawEntity = result[0] as AuthorRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'create',
        error,
      });
    }

    return this.authorMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateAuthorPayload): Promise<Author> {
    const { author } = payload;

    let rawEntity: AuthorRawEntity;

    try {
      const result = await this.databaseClient<AuthorRawEntity>(authorTable)
        .where({ id: author.getId() })
        .update(author.getState(), '*');

      rawEntity = result[0] as AuthorRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'update',
        error,
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
      rawEntity = await this.databaseClient<AuthorRawEntity>(authorTable).select('*').where(whereCondition).first();
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
    const { ids, name, isApproved, userId, bookshelfId, page, pageSize, sortDate } = payload;

    let rawEntities: AuthorRawEntity[];

    try {
      const query = this.databaseClient(authorTable)
        .select([`${authorTable}.id`, `${authorTable}.name`, `${authorTable}.isApproved`, `${authorTable}.createdAt`])
        .distinct();

      if (userId || bookshelfId) {
        query
          .leftJoin(bookAuthorTable, (join) => {
            join.on(`${bookAuthorTable}.authorId`, '=', `${authorTable}.id`);
          })
          .leftJoin(userBookTable, (join) => {
            join.on(`${userBookTable}.bookId`, '=', `${bookAuthorTable}.bookId`);
          })
          .leftJoin(bookshelfTable, (join) => {
            join.on(`${bookshelfTable}.id`, '=', `${userBookTable}.bookshelfId`);
          });

        if (userId) {
          query.where(`${bookshelfTable}.userId`, userId);
        }

        if (bookshelfId) {
          query.where(`${bookshelfTable}.id`, bookshelfId);
        }
      }

      if (ids) {
        query.whereIn('id', ids);
      }

      if (name) {
        query.whereRaw('name ILIKE ?', `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where({ isApproved });
      }

      query.orderBy('id', sortDate ?? 'desc');

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

    try {
      await this.databaseClient<AuthorRawEntity>(authorTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'delete',
        error,
      });
    }
  }

  public async countAuthors(payload: CountAuthorsPayload): Promise<number> {
    const { ids, name, userId, bookshelfId, isApproved } = payload;

    try {
      const query = this.databaseClient<AuthorRawEntity>(authorTable);

      if (userId || bookshelfId) {
        query
          .leftJoin(bookAuthorTable, (join) => {
            join.on(`${bookAuthorTable}.authorId`, '=', `${authorTable}.id`);
          })
          .leftJoin(userBookTable, (join) => {
            join.on(`${userBookTable}.bookId`, '=', `${bookAuthorTable}.bookId`);
          })
          .leftJoin(bookshelfTable, (join) => {
            join.on(`${bookshelfTable}.id`, '=', `${userBookTable}.bookshelfId`);
          });

        if (userId) {
          query.where(`${bookshelfTable}.userId`, userId);
        }

        if (bookshelfId) {
          query.where(`${bookshelfTable}.id`, bookshelfId);
        }
      }

      if (ids) {
        query.whereIn('id', ids);
      }

      if (name) {
        query.whereRaw('name ILIKE ?', `%${name}%`);
      }

      if (isApproved !== undefined) {
        query.where({ isApproved });
      }

      const countResult = (await query.countDistinct(`${authorTable}.id as count`).first()) as
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
        error,
      });
    }
  }
}
