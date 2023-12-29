import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type Writeable } from '../../../../../common/types/util/writeable.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
import { type Book } from '../../../domain/entities/book/book.js';
import { BookDomainActionType } from '../../../domain/entities/book/domainActions/bookDomainActionType.js';
import {
  type BookRepository,
  type CreateBookPayload,
  type FindBookPayload,
  type DeleteBookPayload,
  type UpdateBookPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { type BookWithAuthorRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithAuthorRawEntity.js';

interface UpdateBookActionsPayload {
  bookFields: Partial<Writeable<BookRawEntity>>;
  bookAuthors: {
    add: string[];
    remove: string[];
  };
}

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
            [this.booksAuthorsTable.columns.authorId]: author.getId(),
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

    authors.forEach((author) => createdBook.addAddAuthorDomainAction(author));

    return createdBook;
  }

  public async updateBook(payload: UpdateBookPayload): Promise<Book> {
    const { book } = payload;

    const updatePayload = this.mapDomainActionsToUpdatePayload(book);

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        if (Object.values(updatePayload.bookFields).length > 0) {
          await transaction(this.databaseTable.name)
            .update(updatePayload.bookFields)
            .where({
              [this.databaseTable.columns.id]: book.getId(),
            });
        }

        if (updatePayload.bookAuthors.add.length > 0) {
          await transaction.batchInsert(
            this.booksAuthorsTable.name,
            updatePayload.bookAuthors.add.map((authorId) => ({
              [this.booksAuthorsTable.columns.bookId]: book.getId(),
              [this.booksAuthorsTable.columns.authorId]: authorId,
            })),
          );
        }

        if (updatePayload.bookAuthors.remove.length > 0) {
          await transaction(this.booksAuthorsTable.name)
            .delete()
            .whereIn(this.booksAuthorsTable.columns.authorId, updatePayload.bookAuthors.remove)
            .andWhere({
              [this.booksAuthorsTable.columns.bookId]: book.getId(),
            });
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'update',
      });
    }

    return book;
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
        .leftJoin(this.booksAuthorsTable.name, (join) => {
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
        .leftJoin(this.authorTable.name, (join) => {
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

  private mapDomainActionsToUpdatePayload(book: Book): UpdateBookActionsPayload {
    const domainActions = book.getDomainActions();

    const payload: UpdateBookActionsPayload = {
      bookAuthors: {
        add: [],
        remove: [],
      },
      bookFields: {},
    };

    domainActions.forEach((domainAction) => {
      switch (domainAction.type) {
        case BookDomainActionType.addAuthor:
          payload.bookAuthors.add.push(domainAction.payload.authorId);

          break;

        case BookDomainActionType.deleteAuthor:
          payload.bookAuthors.remove.push(domainAction.payload.authorId);

          break;

        case BookDomainActionType.changeReleaseYear:
          payload.bookFields.releaseYear = domainAction.payload.releaseYear;

          break;

        case BookDomainActionType.changeTitle:
          payload.bookFields.title = domainAction.payload.title;

          break;
      }
    });

    return payload;
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
        [this.databaseTable.columns.id]: existingBook.getId(),
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
      });
    }
  }
}
