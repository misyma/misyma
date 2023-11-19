import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type CreateBookPayload,
  type FindBookPayload,
  type DeleteBookPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';

export class BookRepositoryImpl implements BookRepository {
  private readonly databaseTable = new BookTable();

  public constructor(
    private readonly postgresDatabaseClient: PostgresDatabaseClient,
    private readonly bookMapper: BookMapper,
    private readonly uuidService: UuidService,
  ) {}

  private createQueryBuilder(): QueryBuilder<BookRawEntity> {
    return this.postgresDatabaseClient<BookRawEntity>(this.databaseTable.name);
  }

  public async createBook(payload: CreateBookPayload): Promise<Book> {
    const { title, releaseYear, authorId } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: BookRawEntity[];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await queryBuilder.insert(
        {
          id,
          title,
          releaseYear,
          authorId,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0] as BookRawEntity;

    return this.bookMapper.mapToDomain(rawEntity);
  }

  public async findBook(payload: FindBookPayload): Promise<Book | null> {
    const { id, authorId, title } = payload;

    const queryBuilder = this.createQueryBuilder();

    let whereCondition: Partial<BookRawEntity> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (authorId) {
      whereCondition = {
        ...whereCondition,
        authorId,
      };
    }

    if (title) {
      whereCondition = {
        ...whereCondition,
        title,
      };
    }

    let rawEntity: BookRawEntity | undefined;

    try {
      rawEntity = await queryBuilder.select('*').where(whereCondition).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookMapper.mapToDomain(rawEntity);
  }

  public async deleteBook(payload: DeleteBookPayload): Promise<void> {
    const { id } = payload;

    const existingBook = await this.findBook({ id });

    if (!existingBook) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id,
      });
    }

    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
      });
    }
  }
}
