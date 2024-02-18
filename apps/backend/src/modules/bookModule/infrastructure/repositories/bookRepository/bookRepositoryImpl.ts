import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type Writeable } from '../../../../../common/types/util/writeable.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
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
import { BookGenresTable } from '../../databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';

interface UpdateBookActionsPayload {
  bookFields: Partial<Writeable<BookRawEntity>>;
  bookAuthors: {
    add: string[];
    remove: string[];
  };
  genres: string[];
}

export class BookRepositoryImpl implements BookRepository {
  private readonly databaseTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();
  private readonly bookGenresTable = new BookGenresTable();
  private readonly genresTable = new GenreTable();

  // TODO: add loggerService and log errors when throwing
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookMapper: BookMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async createBook(payload: CreateBookPayload): Promise<Book> {
    const {
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      frontCoverImageUrl,
      backCoverImageUrl,
      status,
      bookshelfId,
      authors,
    } = payload;

    let rawEntities: BookRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        rawEntities = await transaction<BookRawEntity>(this.databaseTable.name).insert(
          {
            id,
            title,
            isbn,
            publisher,
            releaseYear,
            language,
            translator,
            format,
            pages,
            frontCoverImageUrl,
            backCoverImageUrl,
            status,
            bookshelfId,
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

        if (updatePayload.genres.length > 0) {
          await transaction(this.bookGenresTable.name)
            .insert(
              updatePayload.genres.map((genreId) => ({
                [this.bookGenresTable.columns.bookId]: book.getId(),
                [this.bookGenresTable.columns.genreId]: genreId,
              })),
            )
            .onConflict([this.bookGenresTable.columns.bookId, this.bookGenresTable.columns.genreId])
            .merge();
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

    let rawEntities: BookWithJoinsRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name)
        .select([
          `${this.databaseTable.name}.${this.databaseTable.columns.id}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.title}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.isbn}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.publisher}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.releaseYear}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.language}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.translator}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.format}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.pages}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.frontCoverImageUrl}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.backCoverImageUrl}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.status}`,
          `${this.databaseTable.name}.${this.databaseTable.columns.bookshelfId}`,
          `${this.authorTable.name}.${this.authorTable.columns.id} as ${this.databaseTable.authorJoinColumnsAliases.authorId}`,
          `${this.genresTable.name}.${this.genresTable.columns.name} as ${this.databaseTable.genreJoinColumnsAliases.genreName}`,
          `${this.genresTable.name}.${this.genresTable.columns.id} as ${this.databaseTable.genreJoinColumnsAliases.genreId}`,
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
        .leftJoin(this.bookGenresTable.name, (join) => {
          join.on(
            `${this.bookGenresTable.name}.${this.bookGenresTable.columns.bookId}`,
            '=',
            `${this.databaseTable.name}.${this.databaseTable.columns.id}`,
          );
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(
            `${this.genresTable.name}.${this.genresTable.columns.id}`,
            `=`,
            `${this.bookGenresTable.name}.${this.bookGenresTable.columns.genreId}`,
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

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities)[0] as Book;
  }

  private mapDomainActionsToUpdatePayload(book: Book): UpdateBookActionsPayload {
    const domainActions = book.getDomainActions();

    const payload: UpdateBookActionsPayload = {
      bookAuthors: {
        add: [],
        remove: [],
      },
      bookFields: {},
      genres: [],
    };

    domainActions.forEach((domainAction) => {
      switch (domainAction.type) {
        case BookDomainActionType.addAuthor:
          payload.bookAuthors.add.push(domainAction.payload.authorId);

          break;

        case BookDomainActionType.deleteAuthor:
          payload.bookAuthors.remove.push(domainAction.payload.authorId);

          break;

        case BookDomainActionType.updateTitle:
          payload.bookFields.title = domainAction.payload.title;

          break;

        case BookDomainActionType.updateIsbn:
          payload.bookFields.isbn = domainAction.payload.isbn;

          break;

        case BookDomainActionType.updatePublisher:
          payload.bookFields.publisher = domainAction.payload.publisher;

          break;

        case BookDomainActionType.updateReleaseYear:
          payload.bookFields.releaseYear = domainAction.payload.releaseYear;

          break;

        case BookDomainActionType.updateLanguage:
          payload.bookFields.language = domainAction.payload.language;

          break;

        case BookDomainActionType.updateTranslator:
          payload.bookFields.translator = domainAction.payload.translator;

          break;

        case BookDomainActionType.updateFormat:
          payload.bookFields.format = domainAction.payload.format;

          break;

        case BookDomainActionType.updatePages:
          payload.bookFields.pages = domainAction.payload.pages;

          break;

        case BookDomainActionType.updateFrontCoverImageUrl:
          payload.bookFields.frontCoverImageUrl = domainAction.payload.frontCoverImageUrl;

          break;

        case BookDomainActionType.updateBackCoverImageUrl:
          payload.bookFields.backCoverImageUrl = domainAction.payload.backCoverImageUrl;

          break;

        case BookDomainActionType.updateStatus:
          payload.bookFields.status = domainAction.payload.status;

          break;

        case BookDomainActionType.updateBookshelf:
          payload.bookFields.bookshelfId = domainAction.payload.bookshelfId;

          break;

        case BookDomainActionType.updateBookGenres:
          payload.genres = domainAction.payload.genres.map((genre) => genre.getId());

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

    try {
      await this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name)
        .delete()
        .where({
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
