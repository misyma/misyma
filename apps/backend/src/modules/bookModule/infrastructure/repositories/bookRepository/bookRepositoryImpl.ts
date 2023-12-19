import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type CreateBookPayload,
  type FindBookPayload,
  type DeleteBookPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';

export class BookRepositoryImpl implements BookRepository {
  private readonly databaseTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookMapper: BookMapper,
    private readonly uuidService: UuidService,
  ) {}

  private createQueryBuilder(): QueryBuilder<BookRawEntity> {
    return this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name);
  }

  public async createBook(payload: CreateBookPayload): Promise<Book> {
    const { title, releaseYear, authorsIds } = payload;

    let rawEntities: BookRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        rawEntities = await transaction(this.databaseTable.name).insert(
          {
            id,
            title,
            releaseYear,
          },
          '*',
        );

        await transaction.batchInsert(
          this.booksAuthorsTable.name,
          authorsIds.map((authorId) => ({
            [this.booksAuthorsTable.columns.bookId]: id,
            [this.booksAuthorsTable.columns.authorId]: authorId,
          })),
        );
      });
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
    const { id, authorsIds, title } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntity: BookRawEntity | undefined;

    let whereClause: Partial<BookRawEntity> = {};

    if (id) {
      whereClause = {
        ...whereClause,
        [this.databaseTable.columns.id]: id,
      };
    }

    if (title) {
      whereClause = {
        ...whereClause,
        [this.databaseTable.columns.title]: title,
      };
    }

    try {
      rawEntity = await queryBuilder
        .select('*')
        .join(this.booksAuthorsTable.name, (join) => {
          join.on(
            `${this.booksAuthorsTable.name}.${this.booksAuthorsTable.columns.bookId}`,
            '=',
            `${this.databaseTable.name}.${this.databaseTable.columns.id}`,
          );

          if (authorsIds) {
            join.andOnIn(
              `${this.booksAuthorsTable.name}.${this.booksAuthorsTable.columns.authorId}`,
              this.sqliteDatabaseClient.raw('?', [authorsIds.join(',')]),
            );
          }
        })
        .where(whereClause)
        .first();
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
      await queryBuilder.delete().where({
        [this.databaseTable.columns.id]: existingBook.id,
      });
    } catch (error) {
      console.log(error);

      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
      });
    }
  }
}
