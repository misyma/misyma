import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
import { type BookState, Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type FindBookPayload,
  type DeleteBookPayload,
  type SaveBookPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type BooksAuthorsRawEntity } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

type CreateBookPayload = { book: BookState };

type UpdateBookPayload = { book: Book };

export class BookRepositoryImpl implements BookRepository {
  private readonly bookTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();

  public constructor(
    private readonly databaseClient: DatabaseClient,
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
      book: { title, isbn, publisher, releaseYear, language, translator, format, pages, isApproved, authors },
    } = payload;

    let rawEntities: BookRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        rawEntities = await transaction<BookRawEntity>(this.bookTable.name).insert(
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
            isApproved,
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
        resource: 'Book',
        id: book.getId(),
      });
    }

    try {
      await this.databaseClient.transaction(async (transaction) => {
        const { authors: updatedAuthors, ...bookFields } = book.getState();

        await transaction(this.bookTable.name).update(bookFields, '*').where({ id: book.getId() });

        const existingAuthors = existingBook.getAuthors();

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
      rawEntities = await this.databaseClient<BookRawEntity>(this.bookTable.name)
        .select([
          `${this.bookTable.name}.id`,
          `${this.bookTable.name}.title`,
          `${this.bookTable.name}.isbn`,
          `${this.bookTable.name}.publisher`,
          `${this.bookTable.name}.releaseYear`,
          `${this.bookTable.name}.language`,
          `${this.bookTable.name}.translator`,
          `${this.bookTable.name}.format`,
          `${this.bookTable.name}.pages`,
          `${this.bookTable.name}.isApproved`,
          `${this.authorTable.name}.id as authorId`,
          `${this.authorTable.name}.name as authorName`,
          `${this.authorTable.name}.isApproved as isAuthorApproved`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.bookTable.name}.id`);

          if (authorIds) {
            join.andOnIn(
              `${this.booksAuthorsTable.name}.authorId`,
              this.databaseClient.raw('?', [authorIds.join(',')]),
            );
          }
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${this.bookTable.name}.id`, id);
          }

          if (title) {
            builder.where(`${this.bookTable.name}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`"${this.bookTable.name}.bookshelfId"`, bookshelfId);
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

  public async findBooks(): Promise<Book[]> {
    let rawEntities: BookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<BookRawEntity>(this.bookTable.name)
        .select([
          `${this.bookTable.name}.id`,
          `${this.bookTable.name}.title`,
          `${this.bookTable.name}.isbn`,
          `${this.bookTable.name}.publisher`,
          `${this.bookTable.name}.releaseYear`,
          `${this.bookTable.name}.language`,
          `${this.bookTable.name}.translator`,
          `${this.bookTable.name}.format`,
          `${this.bookTable.name}.pages`,
          `${this.bookTable.name}.isApproved`,
          `${this.authorTable.name}.id as authorId`,
          `${this.authorTable.name}.name as authorName`,
          `${this.authorTable.name}.isApproved as isAuthorApproved`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.bookTable.name}.id`);
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        });

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
        resource: 'Book',
        id,
      });
    }

    try {
      await this.databaseClient<BookRawEntity>(this.bookTable.name).delete().where({
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
