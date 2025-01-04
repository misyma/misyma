import { type BookMapper } from './bookMapper/bookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type BookState, Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type FindBookPayload,
  type DeleteBookPayload,
  type SaveBookPayload,
  type FindBooksPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';
import { authorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import { type BookAuthorRawEntity } from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorRawEntity.js';
import { bookAuthorTable } from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import { type BookRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { bookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

type CreateBookPayload = { book: BookState };

type UpdateBookPayload = { book: Book };

export class BookRepositoryImpl implements BookRepository {
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
      book: {
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        isApproved,
        imageUrl,
        authors,
        createdAt,
      },
    } = payload;

    let rawEntities: BookRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        rawEntities = await transaction<BookRawEntity>(bookTable).insert(
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
            imageUrl,
            createdAt,
          },
          '*',
        );

        await transaction.batchInsert(
          bookAuthorTable,
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
        originalError: error,
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
      throw new RepositoryError({
        entity: 'Book',
        operation: 'update',
        reason: 'Book does not exist.',
      });
    }

    try {
      await this.databaseClient.transaction(async (transaction) => {
        const { authors: updatedAuthors, ...bookFields } = book.getState();

        await transaction(bookTable).update(bookFields, '*').where({ id: book.getId() });

        const existingAuthors = existingBook.getAuthors();

        const addedAuthors = updatedAuthors.filter(
          (author) => !existingAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        const removedAuthors = existingAuthors.filter(
          (author) => !updatedAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        if (addedAuthors.length > 0) {
          await transaction.batchInsert<BookAuthorRawEntity>(
            bookAuthorTable,
            addedAuthors.map((author) => ({
              bookId: book.getId(),
              authorId: author.getId(),
            })),
          );
        }

        if (removedAuthors.length > 0) {
          await transaction<BookAuthorRawEntity>(bookAuthorTable)
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
        originalError: error,
      });
    }

    return book;
  }

  public async findBook(payload: FindBookPayload): Promise<Book | null> {
    const { id } = payload;

    let rawEntities: BookWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<BookRawEntity>(bookTable)
        .select([
          `${bookTable}.id`,
          `${bookTable}.title`,
          `${bookTable}.isbn`,
          `${bookTable}.publisher`,
          `${bookTable}.releaseYear`,
          `${bookTable}.language`,
          `${bookTable}.translator`,
          `${bookTable}.format`,
          `${bookTable}.pages`,
          `${bookTable}.isApproved`,
          `${bookTable}.imageUrl`,
          `${bookTable}.createdAt`,
          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),
          this.databaseClient.raw(`array_agg("authors"."createdAt") as "authorCreatedAtDates"`),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${bookTable}.id`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .where((builder) => {
          builder.where(`${bookTable}.id`, id);
        })
        .groupBy(`${bookTable}.id`);
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntities.length) {
      return null;
    }

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities)[0] as Book;
  }

  public async findBooks(payload: FindBooksPayload): Promise<Book[]> {
    const {
      isbn,
      isApproved,
      title,
      language,
      releaseYearBefore,
      releaseYearAfter,
      authorIds,
      page,
      pageSize,
      sortField,
      sortOrder,
    } = payload;

    let rawEntities: BookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<BookRawEntity>(bookTable)
        .select([
          `${bookTable}.id`,
          `${bookTable}.title`,
          `${bookTable}.isbn`,
          `${bookTable}.publisher`,
          `${bookTable}.releaseYear`,
          `${bookTable}.language`,
          `${bookTable}.translator`,
          `${bookTable}.format`,
          `${bookTable}.pages`,
          `${bookTable}.isApproved`,
          `${bookTable}.imageUrl`,
          `${bookTable}.createdAt`,
          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),
          this.databaseClient.raw(`array_agg("authors"."createdAt") as "authorCreatedAtDates"`),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${bookTable}.id`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .where((builder) => {
          if (isbn) {
            builder.where({ isbn });
          }

          if (isApproved !== undefined) {
            builder.where(`${bookTable}.isApproved`, isApproved);
          }

          if (language) {
            builder.where(`${bookTable}.language`, language);
          }

          if (releaseYearBefore) {
            builder.where(`${bookTable}.releaseYear`, '<=', releaseYearBefore);
          }

          if (releaseYearAfter) {
            builder.where(`${bookTable}.releaseYear`, '>=', releaseYearAfter);
          }

          if (title) {
            builder.whereRaw('title ILIKE ?', `%${title}%`);
          }

          if (authorIds) {
            builder.whereIn(`${authorTable}.id`, authorIds);
          }
        })
        .groupBy(`${bookTable}.id`)
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (sortField === 'releaseYear') {
        query.orderBy(`${bookTable}.releaseYear`, sortOrder ?? 'desc');
      } else {
        query.orderBy('id', sortOrder ?? 'desc');
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        originalError: error,
      });
    }

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities) as Book[];
  }

  public async deleteBook(payload: DeleteBookPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookRawEntity>(bookTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countBooks(payload: FindBooksPayload): Promise<number> {
    const { isbn, isApproved, title, authorIds, language, releaseYearAfter, releaseYearBefore } = payload;

    try {
      const countResult = await this.databaseClient<BookRawEntity>(bookTable)
        .countDistinct({ count: `${bookTable}.id` })
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${bookTable}.id`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .where((builder) => {
          if (isbn) {
            builder.where({ isbn });
          }

          if (isApproved !== undefined) {
            builder.where(`${bookTable}.isApproved`, isApproved);
          }

          if (language) {
            builder.where(`${bookTable}.language`, language);
          }

          if (releaseYearBefore) {
            builder.where(`${bookTable}.releaseYear`, '<=', releaseYearBefore);
          }

          if (releaseYearAfter) {
            builder.where(`${bookTable}.releaseYear`, '>=', releaseYearAfter);
          }

          if (title) {
            builder.whereRaw('title ILIKE ?', `%${title}%`);
          }

          if (authorIds) {
            builder.whereIn(`${authorTable}.id`, authorIds);
          }
        })
        .first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Book',
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
        entity: 'Book',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
