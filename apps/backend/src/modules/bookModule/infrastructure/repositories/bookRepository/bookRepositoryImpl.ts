import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
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
import { type BookWithAuthorRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithAuthorRawEntity.js';

export class BookRepositoryImpl implements BookRepository {
  private readonly databaseTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();

  // TODO: add loggerService and log errors when throwing
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookMapper: BookMapper,
    private readonly uuidService: UuidService,
  ) {}

  private createQueryBuilder(): QueryBuilder<BookRawEntity> {
    return this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name);
  }

  public async createBook(payload: CreateBookPayload): Promise<Book> {
    const { title, releaseYear, authors } = payload;

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
          authors.map((author) => ({
            [this.booksAuthorsTable.columns.bookId]: id,
            [this.booksAuthorsTable.columns.authorId]: author.id,
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

    const createdBook = this.bookMapper.mapRawToDomain(rawEntity);

    authors.forEach((author) => createdBook.addAuthor(author));

    return createdBook;
  }

  public async findBook(payload: FindBookPayload): Promise<Book | null> {
    const { id, authorIds: authorsIds, title } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: BookWithAuthorRawEntity[];

    try {
      rawEntities = await queryBuilder
        .select([
          `${this.databaseTable.name}.${this.databaseTable.columns.id}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.title}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.releaseYear}`,
          `${this.authorTable.name}.${this.authorTable.columns.id} as ${this.databaseTable.authorJoinColumnsAliases.authorId}`,
          this.authorTable.columns.firstName,
          this.authorTable.columns.lastName,
        ])
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
        .join(this.authorTable.name, (join) => {
          join.on(
            `${this.authorTable.name}.${this.authorTable.columns.id}`,
            '=',
            `${this.booksAuthorsTable.name}.${this.booksAuthorsTable.columns.authorId}`,
          );
        })
        .where((builder) => {
          if (id) {
            builder.where(`${this.databaseTable.name}.${this.databaseTable.columns.id}`, id);
          }

          if (title) {
            builder.where(`${this.databaseTable.name}.${this.databaseTable.columns.title}`, title);
          }
        });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
      });
    }

    if (!rawEntities.length) {
      return null;
    }

    return this.bookMapper.mapRawWithAuthorToDomain(rawEntities)[0] as Book;
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
      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
      });
    }
  }
}
