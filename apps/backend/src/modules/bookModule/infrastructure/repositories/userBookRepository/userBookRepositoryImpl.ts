import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorsTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/booksAuthorsTable/booksAuthorsTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelvesTable.js';
import { booksReadingsTable } from '../../../../databaseModule/infrastructure/tables/booksReadingsTable/booksReadingsTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/booksTable/booksTable.js';
import { categoriesTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type UserBookCollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksCollectionsTable/userBookCollectionsRawEntity.js';
import { usersBooksCollectionsTable } from '../../../../databaseModule/infrastructure/tables/usersBooksCollectionsTable/usersBooksCollectionsTable.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/userBookRawEntity.js';
import { type UserBookWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/userBookWithJoinsRawEntity.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/usersBooksTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { UserBook, type UserBookState } from '../../../domain/entities/userBook/userBook.js';
import {
  type SaveUserBooksPayload,
  type DeleteUserBooksPayload,
  type FindUserBookPayload,
  type FindUserBooksPayload,
  type SaveUserBookPayload,
  type UserBookRepository,
  type CountUserBooksPayload,
  type FindUserBookOwnerPayload,
  type FindUserBookOwnerResult,
} from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import { type UserBookMapper } from './userBookMapper/userBookMapper.js';

type CreateUserBookPayload = { userBook: UserBookState };

type UpdateUserBookPayload = { userBook: UserBook };

export class UserBookRepositoryImpl implements UserBookRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly userBookMapper: UserBookMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveUserBook(payload: SaveUserBookPayload): Promise<UserBook> {
    const { userBook } = payload;

    if (userBook instanceof UserBook) {
      return this.updateUserBook({ userBook });
    }

    return this.createUserBook({ userBook });
  }

  private async createUserBook(payload: CreateUserBookPayload): Promise<UserBook> {
    const {
      userBook: { imageUrl, status, isFavorite, bookshelfId, bookId, collections, createdAt },
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<UserBookRawEntity>(usersBooksTable.name).insert(
          {
            id,
            image_url: imageUrl ?? undefined,
            status,
            is_favorite: isFavorite,
            bookshelf_id: bookshelfId,
            book_id: bookId,
            created_at: createdAt,
          },
          '*',
        );

        if (collections?.length) {
          await transaction.batchInsert<UserBookCollectionRawEntity>(
            usersBooksCollectionsTable.name,
            collections.map((collection) => ({
              user_book_id: id,
              collection_id: collection.getId(),
            })),
          );
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'create',
        originalError: error,
      });
    }

    return (await this.findUserBook({ id })) as UserBook;
  }

  private async updateUserBook(payload: UpdateUserBookPayload): Promise<UserBook> {
    const { userBook } = payload;

    const existingUserBook = await this.findUserBook({ id: userBook.id });

    if (!existingUserBook) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'update',
        reason: 'UserBook does not exist.',
      });
    }

    const { bookshelfId, status, imageUrl, isFavorite } = userBook.getState();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<UserBookRawEntity>(usersBooksTable.name)
          .update({
            bookshelf_id: bookshelfId,
            status,
            is_favorite: isFavorite,
            image_url: imageUrl,
          })
          .where({ id: userBook.id });

        const { collections: updatedCollections } = userBook.getState();

        const existingCollections = existingUserBook.collections || [];

        const addedCollections = (updatedCollections ?? []).filter(
          (collection) =>
            !existingCollections.some((currentCollection) => currentCollection.getId() === collection.getId()),
        );

        const removedCollections = existingCollections.filter(
          (collection) =>
            !(updatedCollections ?? []).some((currentCollection) => currentCollection.getId() === collection.getId()),
        );

        if (addedCollections.length > 0) {
          await transaction<UserBookCollectionRawEntity>(usersBooksCollectionsTable.name)
            .insert(
              addedCollections.map((collection) => ({
                user_book_id: userBook.id,
                collection_id: collection.getId(),
              })),
            )
            .onConflict(['user_book_id', 'collection_id'])
            .merge();
        }

        if (removedCollections.length > 0) {
          await transaction<UserBookCollectionRawEntity>(usersBooksCollectionsTable.name)
            .delete()
            .whereIn(
              'collection_id',
              removedCollections.map((collection) => collection.getId()),
            )
            .andWhere({
              user_book_id: userBook.id,
            });
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'update',
        originalError: error,
      });
    }

    return (await this.findUserBook({ id: userBook.id })) as UserBook;
  }

  public async saveUserBooks(payload: SaveUserBooksPayload): Promise<void> {
    const { userBooks } = payload;

    const payloads: Partial<UserBookRawEntity>[] = userBooks.map((userBook) => ({
      id: userBook.id,
      image_url: userBook.imageUrl,
      status: userBook.status,
      is_favorite: userBook.isFavorite,
      bookshelf_id: userBook.bookshelfId,
      book_id: userBook.bookId,
      created_at: userBook.createdAt,
    }));

    try {
      await this.databaseClient<UserBookRawEntity>(usersBooksTable.name).insert(payloads).onConflict('id').merge();
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'save',
        originalError: error,
      });
    }
  }

  public async findUserBook(payload: FindUserBookPayload): Promise<UserBook | null> {
    const { id, title, bookshelfId, bookId, authorIds } = payload;

    let rawEntity: UserBookWithJoinsRawEntity | undefined;

    try {
      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM ${booksReadingsTable.name} br
        WHERE br."user_book_id" = ${usersBooksTable.name}.id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_rating"`);

      rawEntity = await this.databaseClient<UserBookRawEntity>(usersBooksTable.name)
        .select([
          usersBooksTable.allColumns,
          `${booksTable.columns.id} as book_id`,
          `${booksTable.columns.title} as title`,
          `${booksTable.columns.category_id} as category_id`,
          `${booksTable.columns.isbn} as isbn`,
          `${booksTable.columns.publisher} as publisher`,
          `${booksTable.columns.release_year} as release_year`,
          `${booksTable.columns.language} as language`,
          `${booksTable.columns.translator} as translator`,
          `${booksTable.columns.format} as format`,
          `${booksTable.columns.pages} as pages`,
          booksTable.columns.is_approved,
          `${booksTable.columns.image_url} as book_image_url`,
          `${categoriesTable.columns.name} as category_name`,
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.id}) as author_ids`),
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.name}) as author_names`),
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.is_approved}) as author_approvals`),
          latestRatingSelect,
        ])
        .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.book_id, usersBooksTable.columns.book_id)
        .leftJoin(authorsTable.name, authorsTable.columns.id, booksAuthorsTable.columns.author_id)
        .leftJoin(booksTable.name, booksTable.columns.id, usersBooksTable.columns.book_id)
        .leftJoin(booksReadingsTable.name, booksReadingsTable.columns.user_book_id, usersBooksTable.columns.id)
        .leftJoin(categoriesTable.name, categoriesTable.columns.id, booksTable.columns.category_id)
        .where((builder) => {
          if (id) {
            builder.where(usersBooksTable.columns.id, id);
          }

          if (title) {
            builder.where(booksTable.columns.title, title);
          }

          if (bookshelfId) {
            builder.where(usersBooksTable.columns.bookshelf_id, bookshelfId);
          }

          if (bookId) {
            builder.where(usersBooksTable.columns.book_id, bookId);
          }

          if (authorIds) {
            builder.whereIn(authorsTable.columns.id, authorIds);
          }
        })
        .groupBy([usersBooksTable.columns.id, booksTable.columns.id, categoriesTable.columns.name])
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.userBookMapper.mapRawWithJoinsToDomain(rawEntity);
  }

  public async findUserBooks(payload: FindUserBooksPayload): Promise<UserBook[]> {
    const {
      bookshelfId,
      userId,
      bookId,
      categoryId,
      authorId,
      page,
      pageSize,
      isbn,
      title,
      status,
      isFavorite,
      sortField,
      sortOrder,
      language,
      releaseYearAfter,
      releaseYearBefore,
      isRated,
    } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM ${booksReadingsTable.name} br
        WHERE br."user_book_id" = ${usersBooksTable.name}.id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_rating"`);
      const latestReadingDateSelect = this.databaseClient.raw(`(
        SELECT br."ended_at"
        FROM "${booksReadingsTable.name}" br
        WHERE br."user_book_id" = "${usersBooksTable.name}".id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_reading_date"`);

      const readingsCountSubquery = this.databaseClient
        .select('user_book_id')
        .count('* as count')
        .from(booksReadingsTable.name)
        .groupBy('user_book_id')
        .as('readings_counts');

      const query = this.databaseClient<UserBookRawEntity>(usersBooksTable.name)
        .select([
          usersBooksTable.allColumns,
          `${booksTable.columns.id} as book_id`,
          `${booksTable.columns.title} as title`,
          `${booksTable.columns.category_id} as category_id`,
          `${booksTable.columns.isbn} as isbn`,
          `${booksTable.columns.publisher} as publisher`,
          `${booksTable.columns.release_year} as release_year`,
          `${booksTable.columns.language} as language`,
          `${booksTable.columns.translator} as translator`,
          `${booksTable.columns.format} as format`,
          `${booksTable.columns.pages} as pages`,
          booksTable.columns.is_approved,
          `${booksTable.columns.image_url} as book_image_url`,
          `${categoriesTable.columns.name} as category_name`,
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.id}) as author_ids`),
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.name}) as author_names`),
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.is_approved}) as author_approvals`),
          latestRatingSelect,
          ...(sortField === 'readingDate' ? [latestReadingDateSelect] : []),
        ])
        .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.book_id, usersBooksTable.columns.book_id)
        .leftJoin(authorsTable.name, authorsTable.columns.id, booksAuthorsTable.columns.author_id)
        .leftJoin(booksTable.name, booksTable.columns.id, usersBooksTable.columns.book_id)
        .leftJoin(categoriesTable.name, categoriesTable.columns.id, booksTable.columns.category_id);

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readings_counts.user_book_id', usersBooksTable.columns.id)
          .where('readings_counts.count', '>', 0);
      }

      if (userId) {
        query
          .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id)
          .where(bookshelvesTable.columns.user_id, userId);
      }

      if (bookId) {
        query.where(usersBooksTable.columns.book_id, bookId);
      }

      if (authorId) {
        query.where(booksAuthorsTable.columns.author_id, authorId);
      }

      if (isbn) {
        query.where(booksTable.columns.isbn, isbn);
      }

      if (title) {
        query.whereRaw(`${booksTable.columns.title} ILIKE ?`, `%${title}%`);
      }

      if (status) {
        query.where(usersBooksTable.columns.status, status);
      }

      if (isFavorite !== undefined) {
        query.where(usersBooksTable.columns.is_favorite, isFavorite);
      }

      if (bookshelfId) {
        query.where(usersBooksTable.columns.bookshelf_id, bookshelfId);
      }

      if (categoryId) {
        query.where(booksTable.columns.category_id, categoryId);
      }

      if (releaseYearAfter !== undefined) {
        query.where(booksTable.columns.release_year, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(booksTable.columns.release_year, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(booksTable.columns.language, '=', language);
      }

      query.groupBy([usersBooksTable.columns.id, booksTable.columns.id, categoriesTable.columns.name]);

      if (sortField === 'releaseYear') {
        query.orderBy(booksTable.columns.release_year, sortOrder ?? 'desc');
      } else if (sortField === 'rating') {
        query.orderBy('latest_rating', sortOrder ?? 'desc', 'last');
      } else if (sortField === 'readingDate') {
        query.orderBy('latest_reading_date', sortOrder ?? 'desc', 'last');
      } else {
        query.orderBy(usersBooksTable.columns.id, sortOrder ?? 'desc');
      }

      if (pageSize && page) {
        query.limit(pageSize).offset(pageSize * (page - 1));
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.userBookMapper.mapRawWithJoinsToDomain(rawEntity));
  }

  public async findUserBookOwner(payload: FindUserBookOwnerPayload): Promise<FindUserBookOwnerResult> {
    const { id } = payload;

    try {
      const result = await this.databaseClient(usersBooksTable.name)
        .select([`${bookshelvesTable.columns.user_id} as user_id`])
        .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id)
        .where(usersBooksTable.columns.id, id)
        .first();

      if (!result) {
        return { userId: undefined };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return { userId: result.user_id };
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'findOwner',
        originalError: error,
      });
    }
  }

  public async deleteUserBooks(payload: DeleteUserBooksPayload): Promise<void> {
    const { ids } = payload;

    try {
      await this.databaseClient<UserBookRawEntity>(usersBooksTable.name).delete().whereIn('id', ids);
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countUserBooks(payload: CountUserBooksPayload): Promise<number> {
    const {
      bookshelfId,
      userId,
      authorId,
      bookId,
      categoryId,
      isbn,
      title,
      status,
      isFavorite,
      language,
      releaseYearAfter,
      releaseYearBefore,
      isRated,
    } = payload;

    try {
      const readingsCountSubquery = this.databaseClient
        .select('user_book_id')
        .count('* as count')
        .from(booksReadingsTable.name)
        .groupBy('user_book_id')
        .as('readings_counts');

      const query = this.databaseClient<UserBookRawEntity>(usersBooksTable.name);

      if (authorId) {
        query
          .join(booksAuthorsTable.name, booksAuthorsTable.columns.book_id, usersBooksTable.columns.book_id)
          .where(booksAuthorsTable.columns.author_id, authorId);
      }

      if (
        isbn ||
        title ||
        releaseYearAfter !== undefined ||
        releaseYearBefore !== undefined ||
        language ||
        categoryId
      ) {
        query.join(booksTable.name, booksTable.columns.id, usersBooksTable.columns.book_id);
      }

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readings_counts.user_book_id', usersBooksTable.columns.id)
          .where('readings_counts.count', '>', 0);
      }

      if (userId) {
        query
          .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id)
          .where(bookshelvesTable.columns.user_id, userId);
      }

      if (bookId) {
        query.where(usersBooksTable.columns.book_id, bookId);
      }

      if (isbn) {
        query.where(booksTable.columns.isbn, isbn);
      }

      if (title) {
        query.whereRaw(`${booksTable.columns.title} ILIKE ?`, `%${title}%`);
      }

      if (status) {
        query.where(usersBooksTable.columns.status, status);
      }

      if (isFavorite !== undefined) {
        query.where(usersBooksTable.columns.is_favorite, isFavorite);
      }

      if (bookshelfId) {
        query.where(usersBooksTable.columns.bookshelf_id, bookshelfId);
      }

      if (categoryId) {
        query.where(booksTable.columns.category_id, categoryId);
      }

      if (releaseYearAfter !== undefined) {
        query.where(booksTable.columns.release_year, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(booksTable.columns.release_year, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(booksTable.columns.language, '=', language);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'UserBook',
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
        entity: 'UserBook',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
