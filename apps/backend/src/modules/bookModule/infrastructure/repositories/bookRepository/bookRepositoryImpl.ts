import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
import { type BookState, Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type FindBookPayload,
  type DeleteBookPayload,
  type SaveBookPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { BookGenresTable } from '../../databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';

type CreateBookPayload = { book: BookState };

type UpdateBookPayload = { book: Book };

export class BookRepositoryImpl implements BookRepository {
  private readonly databaseTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();
  private readonly bookGenresTable = new BookGenresTable();
  private readonly genresTable = new GenreTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookMapper: BookMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveBook(payload: SaveBookPayload): Promise<Book> {
    const { book } = payload;

    if (book instanceof Book) {
      return this.updateBook({ book });
    }

    return this.createBook({ book });
  }

  private async createBook(payload: CreateBookPayload): Promise<Book> {
    const {
      book: {
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
      },
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

    authors.forEach((author) => createdBook.addAuthor(author));

    return createdBook;
  }

  private async updateBook(payload: UpdateBookPayload): Promise<Book> {
    const { book } = payload;

    const existingBook = await this.findBook({ id: book.getId() });

    if (!existingBook) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: book.getId(),
      });
    }

    try {
      await this.sqliteDatabaseClient.transaction(async (transaction) => {
        const { authors: updatedAuthors, genres: updatedGenres, ...bookFields } = book.getState();

        await transaction(this.databaseTable.name).update(bookFields, '*').where({ id: book.getId() });

        const existingAuthors = existingBook.getAuthors();

        const existingGenres = existingBook.getGenres();

        const addedGenres = updatedGenres.filter(
          (genre) => !existingGenres.some((currentGenre) => currentGenre.getId() === genre.getId()),
        );

        const removedGenres = existingGenres.filter(
          (genre) => !updatedGenres.some((currentGenre) => currentGenre.getId() === genre.getId()),
        );

        const addedAuthors = updatedAuthors.filter(
          (author) => !existingAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        const removedAuthors = existingAuthors.filter(
          (author) => !updatedAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        if (addedAuthors.length > 0) {
          await transaction.batchInsert(
            this.booksAuthorsTable.name,
            addedAuthors.map((author) => ({
              [this.booksAuthorsTable.columns.bookId]: book.getId(),
              [this.booksAuthorsTable.columns.authorId]: author.getId(),
            })),
          );
        }

        if (removedAuthors.length > 0) {
          await transaction(this.booksAuthorsTable.name)
            .delete()
            .whereIn(
              this.booksAuthorsTable.columns.authorId,
              removedAuthors.map((author) => author.getId()),
            )
            .andWhere({
              [this.booksAuthorsTable.columns.bookId]: book.getId(),
            });
        }

        if (addedGenres.length > 0) {
          await transaction(this.bookGenresTable.name)
            .insert(
              addedGenres.map((genre) => ({
                [this.bookGenresTable.columns.bookId]: book.getId(),
                [this.bookGenresTable.columns.genreId]: genre.getId(),
              })),
            )
            .onConflict([this.bookGenresTable.columns.bookId, this.bookGenresTable.columns.genreId])
            .merge();
        }

        if (removedGenres.length > 0) {
          await transaction(this.bookGenresTable.name)
            .delete()
            .whereIn(
              this.bookGenresTable.columns.genreId,
              removedGenres.map((genre) => genre.getId()),
            )
            .andWhere({
              [this.bookGenresTable.columns.bookId]: book.getId(),
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
