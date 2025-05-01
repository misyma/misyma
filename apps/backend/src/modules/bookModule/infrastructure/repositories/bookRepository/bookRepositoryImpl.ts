import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorTable/authorTable.js';
import { type BookAuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorRawEntity.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorTable.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookWithJoinsRawEntity.js';
import { categoryTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type BookState, Book } from '../../../domain/entities/book/book.js';
import {
  type BookRepository,
  type FindBookPayload,
  type DeleteBookPayload,
  type SaveBookPayload,
  type FindBooksPayload,
} from '../../../domain/repositories/bookRepository/bookRepository.js';

import { type BookMapper } from './bookMapper/bookMapper.js';

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
        categoryId,
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
        rawEntities = await transaction<BookRawEntity>(booksTable).insert(
          {
            id,
            title,
            isbn,
            categoryId,
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
          booksAuthorsTable,
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

    authors.forEach((author) => {
      createdBook.addAuthor(author);
    });

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
        const { authors: updatedAuthors, categoryName: _, ...bookFields } = book.getState();

        await transaction(booksTable).update(bookFields, '*').where({ id: book.getId() });

        const existingAuthors = existingBook.getAuthors();

        const addedAuthors = updatedAuthors.filter(
          (author) => !existingAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        const removedAuthors = existingAuthors.filter(
          (author) => !updatedAuthors.some((currentAuthor) => currentAuthor.getId() === author.getId()),
        );

        if (addedAuthors.length > 0) {
          await transaction.batchInsert<BookAuthorRawEntity>(
            booksAuthorsTable,
            addedAuthors.map((author) => ({
              bookId: book.getId(),
              authorId: author.getId(),
            })),
          );
        }

        if (removedAuthors.length > 0) {
          await transaction<BookAuthorRawEntity>(booksAuthorsTable)
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
      rawEntities = await this.databaseClient<BookRawEntity>(booksTable)
        .select([
          `${booksTable}.id`,
          `${booksTable}.categoryId`,
          `${categoryTable}.name as categoryName`,
          `${booksTable}.title`,
          `${booksTable}.isbn`,
          `${booksTable}.publisher`,
          `${booksTable}.releaseYear`,
          `${booksTable}.language`,
          `${booksTable}.translator`,
          `${booksTable}.format`,
          `${booksTable}.pages`,
          `${booksTable}.isApproved`,
          `${booksTable}.imageUrl`,
          `${booksTable}.createdAt`,
          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),
          this.databaseClient.raw(`array_agg("authors"."createdAt") as "authorCreatedAtDates"`),
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.bookId`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .leftJoin(categoryTable, (join) => {
          join.on(`${categoryTable}.id`, '=', `${booksTable}.categoryId`);
        })
        .where((builder) => {
          builder.where(`${booksTable}.id`, id);
        })
        .groupBy(`${booksTable}.id`, `${categoryTable}.name`);
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
      const query = this.databaseClient<BookRawEntity>(booksTable)
        .select([
          `${booksTable}.id`,
          `${booksTable}.title`,
          `${booksTable}.categoryId`,
          `${categoryTable}.name as categoryName`,
          `${booksTable}.isbn`,
          `${booksTable}.publisher`,
          `${booksTable}.releaseYear`,
          `${booksTable}.language`,
          `${booksTable}.translator`,
          `${booksTable}.format`,
          `${booksTable}.pages`,
          `${booksTable}.isApproved`,
          `${booksTable}.imageUrl`,
          `${booksTable}.createdAt`,
          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),
          this.databaseClient.raw(`array_agg("authors"."createdAt") as "authorCreatedAtDates"`),
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.bookId`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .leftJoin(categoryTable, (join) => {
          join.on(`${booksTable}.categoryId`, '=', `${categoryTable}.id`);
        })
        .where((builder) => {
          if (isbn) {
            builder.where({ isbn });
          }

          if (isApproved !== undefined) {
            builder.where(`${booksTable}.isApproved`, isApproved);
          }

          if (language) {
            builder.where(`${booksTable}.language`, language);
          }

          if (releaseYearBefore) {
            builder.where(`${booksTable}.releaseYear`, '<=', releaseYearBefore);
          }

          if (releaseYearAfter) {
            builder.where(`${booksTable}.releaseYear`, '>=', releaseYearAfter);
          }

          if (title) {
            builder.whereRaw('title ILIKE ?', `%${title}%`);
          }

          if (authorIds) {
            builder.whereIn(`${authorsTable}.id`, authorIds);
          }
        })
        .groupBy(`${booksTable}.id`, `${categoryTable}.name`)
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (sortField === 'releaseYear') {
        query.orderBy(`${booksTable}.releaseYear`, sortOrder ?? 'desc');
      } else if (sortField === 'title') {
        query.orderBy(`${booksTable}.title`, sortOrder ?? 'asc');
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

    return this.bookMapper.mapRawWithJoinsToDomain(rawEntities);
  }

  public async deleteBook(payload: DeleteBookPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookRawEntity>(booksTable).delete().where({ id });
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
      const countResult = await this.databaseClient<BookRawEntity>(booksTable)
        .countDistinct({ count: `${booksTable}.id` })
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.bookId`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .where((builder) => {
          if (isbn) {
            builder.where({ isbn });
          }

          if (isApproved !== undefined) {
            builder.where(`${booksTable}.isApproved`, isApproved);
          }

          if (language) {
            builder.where(`${booksTable}.language`, language);
          }

          if (releaseYearBefore) {
            builder.where(`${booksTable}.releaseYear`, '<=', releaseYearBefore);
          }

          if (releaseYearAfter) {
            builder.where(`${booksTable}.releaseYear`, '>=', releaseYearAfter);
          }

          if (title) {
            builder.whereRaw('title ILIKE ?', `%${title}%`);
          }

          if (authorIds) {
            builder.whereIn(`${authorsTable}.id`, authorIds);
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
