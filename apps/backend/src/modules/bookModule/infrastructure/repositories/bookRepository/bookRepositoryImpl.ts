import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
import { type BookState, Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type FindBookPayload,
  type DeleteBookPayload,
  type SaveBookPayload,
  type FindBooksPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type BookGenresRawEntity } from '../../databases/bookDatabase/tables/bookGenresTable/bookGenresRawEntity.js';
import { BookGenresTable } from '../../databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { type BooksAuthorsRawEntity } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
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
        imageUrl,
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
            imageUrl,
            status,
            bookshelfId,
          },
          '*',
        );

        await transaction.batchInsert(
          this.booksAuthorsTable.name,
          authors.map((author) => ({
            bookId: id,
            authorId: author.getId(),
          })),
        );
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'create',
        error,
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
          await transaction.batchInsert<BooksAuthorsRawEntity>(
            this.booksAuthorsTable.name,
            addedAuthors.map((author) => ({
              bookId: book.getId(),
              authorId: author.getId(),
            })),
          );
        }

        if (removedAuthors.length > 0) {
          await transaction<BooksAuthorsRawEntity>(this.booksAuthorsTable.name)
            .delete()
            .whereIn(
              'authorId',
              removedAuthors.map((author) => author.getId()),
            )
            .andWhere({
              bookId: book.getId(),
            });
        }

        if (addedGenres.length > 0) {
          await transaction<BookGenresRawEntity>(this.bookGenresTable.name)
            .insert(
              addedGenres.map((genre) => ({
                bookId: book.getId(),
                genreId: genre.getId(),
              })),
            )
            .onConflict(['bookId', 'genreId'])
            .merge();
        }

        if (removedGenres.length > 0) {
          await transaction<BookGenresRawEntity>(this.bookGenresTable.name)
            .delete()
            .whereIn(
              'genreId',
              removedGenres.map((genre) => genre.getId()),
            )
            .andWhere({
              bookId: book.getId(),
            });
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'update',
        error,
      });
    }

    return book;
  }

  public async findBook(payload: FindBookPayload): Promise<Book | null> {
    const { id, authorIds, title, bookshelfId } = payload;

    let rawEntities: BookWithJoinsRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name)
        .select([
          `${this.databaseTable.name}.id`,
          `${this.databaseTable.name}.title`,
          `${this.databaseTable.name}.isbn`,
          `${this.databaseTable.name}.publisher`,
          `${this.databaseTable.name}.releaseYear`,
          `${this.databaseTable.name}.language`,
          `${this.databaseTable.name}.translator`,
          `${this.databaseTable.name}.format`,
          `${this.databaseTable.name}.pages`,
          `${this.databaseTable.name}.imageUrl`,
          `${this.databaseTable.name}.status`,
          `${this.databaseTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          `${this.genresTable.name}.name as genreName`,
          `${this.genresTable.name}.id as genreId`,
          'firstName',
          'lastName',
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.databaseTable.name}.id`);

          if (authorIds) {
            join.andOnIn(
              `${this.booksAuthorsTable.name}.authorId`,
              this.sqliteDatabaseClient.raw('?', [authorIds.join(',')]),
            );
          }
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.bookGenresTable.name, (join) => {
          join.on(`${this.bookGenresTable.name}.bookId`, '=', `${this.databaseTable.name}.id`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.bookGenresTable.name}.genreId`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${this.databaseTable.name}.id`, id);
          }

          if (title) {
            builder.where(`${this.databaseTable.name}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`"${this.databaseTable.name}.bookshelfId"`, bookshelfId);
          }
        });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }

    if (!rawEntities.length) {
      return null;
    }

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities)[0] as Book;
  }

  public async findBooks(payload: FindBooksPayload): Promise<Book[]> {
    const { bookshelfId, ids } = payload;

    let rawEntities: BookWithJoinsRawEntity[];

    try {
      const query = this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name)
        .select([
          `${this.databaseTable.name}.id`,
          `${this.databaseTable.name}.title`,
          `${this.databaseTable.name}.isbn`,
          `${this.databaseTable.name}.publisher`,
          `${this.databaseTable.name}.releaseYear`,
          `${this.databaseTable.name}.language`,
          `${this.databaseTable.name}.translator`,
          `${this.databaseTable.name}.format`,
          `${this.databaseTable.name}.pages`,
          `${this.databaseTable.name}.imageUrl`,
          `${this.databaseTable.name}.status`,
          `${this.databaseTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          `${this.genresTable.name}.name as genreName`,
          `${this.genresTable.name}.id as genreId`,
          'firstName',
          'lastName',
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.databaseTable.name}.id`);
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.bookGenresTable.name, (join) => {
          join.on(`${this.bookGenresTable.name}.bookId`, '=', `${this.databaseTable.name}.id`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.bookGenresTable.name}.genreId`);
        });

      if (ids.length > 0) {
        query.whereIn(`${this.databaseTable.name}.id`, ids);
      }

      if (bookshelfId) {
        query.where(`${this.databaseTable.name}.bookshelfId`, bookshelfId);
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities) as Book[];
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
      await this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name).delete().where({
        id: existingBook.getId(),
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
        error,
      });
    }
  }
}
