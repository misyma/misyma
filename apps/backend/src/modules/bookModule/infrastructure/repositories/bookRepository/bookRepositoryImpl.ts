import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorTable/authorTable.js';
import { type BookAuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorRawEntity.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/bookTable/bookTable.js';
import { type BookWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookWithJoinsRawEntity.js';
import { categoriesTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookTable.js';
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
            category_id: categoryId,
            publisher,
            release_year: releaseYear,
            language,
            translator,
            format,
            pages,
            is_approved: isApproved,
            image_url: imageUrl,
          },
          '*',
        );

        await transaction.batchInsert<BookAuthorRawEntity>(
          booksAuthorsTable,
          authors.map((author) => ({
            book_id: id,
            author_id: author.getId(),
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
        const {
          authors: updatedAuthors,
          isApproved,
          language,
          releaseYear,
          categoryId,
          format,
          imageUrl,
          isbn,
          pages,
          publisher,
          title,
          translator,
        } = book.getState();

        await transaction<BookRawEntity>(booksTable)
          .update({
            is_approved: isApproved,
            language,
            release_year: releaseYear,
            category_id: categoryId,
            format,
            image_url: imageUrl,
            isbn,
            pages,
            publisher,
            title,
            translator,
          })
          .where({ id: book.getId() });

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
              book_id: book.getId(),
              author_id: author.getId(),
            })),
          );
        }

        if (removedAuthors.length > 0) {
          await transaction<BookAuthorRawEntity>(booksAuthorsTable)
            .delete()
            .whereIn(
              'author_id',
              removedAuthors.map((author) => author.getId()),
            )
            .andWhere({
              book_id: book.getId(),
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
          `${booksTable}.category_id`,
          `${categoriesTable}.name as category_name`,
          `${booksTable}.title`,
          `${booksTable}.isbn`,
          `${booksTable}.publisher`,
          `${booksTable}.release_year`,
          `${booksTable}.language`,
          `${booksTable}.translator`,
          `${booksTable}.format`,
          `${booksTable}.pages`,
          `${booksTable}.is_approved`,
          `${booksTable}.image_url`,
          this.databaseClient.raw(`array_agg("authors"."id") as "author_ids"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "author_names"`),
          this.databaseClient.raw(`array_agg("authors"."is_approved") as "author_approvals"`),
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.book_id`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.author_id`);
        })
        .leftJoin(categoriesTable, (join) => {
          join.on(`${categoriesTable}.id`, '=', `${booksTable}.category_id`);
        })
        .where((builder) => {
          builder.where(`${booksTable}.id`, id);
        })
        .groupBy(`${booksTable}.id`, `${categoriesTable}.name`);
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
      excludeOwnedByUserId,
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
          `${booksTable}.category_id`,
          `${categoriesTable}.name as category_name`,
          `${booksTable}.isbn`,
          `${booksTable}.publisher`,
          `${booksTable}.release_year`,
          `${booksTable}.language`,
          `${booksTable}.translator`,
          `${booksTable}.format`,
          `${booksTable}.pages`,
          `${booksTable}.is_approved`,
          `${booksTable}.image_url`,
          this.databaseClient.raw(`array_agg("authors"."id") as "author_ids"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "author_names"`),
          this.databaseClient.raw(`array_agg("authors"."is_approved") as "author_approvals"`),
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.book_id`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.author_id`);
        })
        .leftJoin(categoriesTable, (join) => {
          join.on(`${booksTable}.category_id`, '=', `${categoriesTable}.id`);
        });

      if (excludeOwnedByUserId) {
        const ownedBooksSubquery = this.databaseClient
          .select('book_id')
          .from(usersBooksTable)
          .join(bookshelvesTable, 'bookshelves.id', '=', 'users_books.bookshelf_id')
          .where('bookshelves.user_id', excludeOwnedByUserId)
          .as('owned_books');

        query
          .leftJoin(ownedBooksSubquery, 'owned_books.book_id', '=', `${booksTable}.id`)
          .whereNull('owned_books.book_id');
      }

      if (isbn) {
        query.where({ isbn });
      }

      if (isApproved !== undefined) {
        query.where(`${booksTable}.is_approved`, isApproved);
      }

      if (language) {
        query.where(`${booksTable}.language`, language);
      }

      if (releaseYearBefore) {
        query.where(`${booksTable}.release_year`, '<=', releaseYearBefore);
      }

      if (releaseYearAfter) {
        query.where(`${booksTable}.release_year`, '>=', releaseYearAfter);
      }

      if (title) {
        query.whereRaw('title ILIKE ?', `%${title}%`);
      }

      if (authorIds) {
        query.whereIn(`${authorsTable}.id`, authorIds);
      }

      if (sortField === 'releaseYear') {
        query.orderBy(`${booksTable}.release_year`, sortOrder ?? 'desc');
      } else if (sortField === 'title') {
        query.orderBy(`${booksTable}.title`, sortOrder ?? 'asc');
      } else {
        query.orderBy('id', sortOrder ?? 'desc');
      }

      rawEntities = await query
        .groupBy(`${booksTable}.id`, `${categoriesTable}.name`)
        .limit(pageSize)
        .offset(pageSize * (page - 1));
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
    const { isbn, isApproved, title, excludeOwnedByUserId, authorIds, language, releaseYearAfter, releaseYearBefore } =
      payload;

    try {
      const query = this.databaseClient<BookRawEntity>(booksTable)
        .countDistinct({ count: `${booksTable}.id` })
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.book_id`, '=', `${booksTable}.id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.author_id`);
        });

      if (excludeOwnedByUserId) {
        const ownedBooksSubquery = this.databaseClient
          .select('book_id as book_id')
          .from(usersBooksTable)
          .join(bookshelvesTable, 'bookshelves.id', '=', 'users_books.bookshelf_id')
          .where('bookshelves.user_id', excludeOwnedByUserId)
          .as('owned_books');

        query
          .leftJoin(ownedBooksSubquery, 'owned_books.book_id', '=', `${booksTable}.id`)
          .whereNull('owned_books.book_id');
      }

      if (isbn) {
        query.where({ isbn });
      }

      if (isApproved !== undefined) {
        query.where(`${booksTable}.is_approved`, isApproved);
      }

      if (language) {
        query.where(`${booksTable}.language`, language);
      }

      if (releaseYearBefore) {
        query.where(`${booksTable}.release_year`, '<=', releaseYearBefore);
      }

      if (releaseYearAfter) {
        query.where(`${booksTable}.release_year`, '>=', releaseYearAfter);
      }

      if (title) {
        query.whereRaw('title ILIKE ?', `%${title}%`);
      }

      if (authorIds) {
        query.whereIn(`${authorsTable}.id`, authorIds);
      }

      const countResult = await query.first();

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
