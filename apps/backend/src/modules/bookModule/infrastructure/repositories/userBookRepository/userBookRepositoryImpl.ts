import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorTable/authorTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorTable.js';
import { booksReadingsTable } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/bookTable/bookTable.js';
import { categoriesTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type UserBookCollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { usersBooksCollectionsTable } from '../../../../databaseModule/infrastructure/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookRawEntity.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookTable.js';
import { type UserBookWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookWithJoinsRawEntity.js';
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
        await transaction<UserBookRawEntity>(usersBooksTable).insert(
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
            usersBooksCollectionsTable,
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
        await transaction<UserBookRawEntity>(usersBooksTable)
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
          await transaction<UserBookCollectionRawEntity>(usersBooksCollectionsTable)
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
          await transaction<UserBookCollectionRawEntity>(usersBooksCollectionsTable)
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
      await this.databaseClient<UserBookRawEntity>(usersBooksTable).insert(payloads).onConflict('id').merge();
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
      const userBookSelect = [
        `${usersBooksTable}.id`,
        `${usersBooksTable}.image_url`,
        `${usersBooksTable}.status`,
        `${usersBooksTable}.is_favorite`,
        `${usersBooksTable}.bookshelf_id`,
        `${usersBooksTable}.created_at`,
      ];

      const bookSelect = [
        `${booksTable}.id as bookId`,
        `${booksTable}.title as title`,
        `${booksTable}.category_id as category_id`,
        `${booksTable}.isbn as isbn`,
        `${booksTable}.publisher as publisher`,
        `${booksTable}.release_year as release_year`,
        `${booksTable}.language as language`,
        `${booksTable}.translator as translator`,
        `${booksTable}.format as format`,
        `${booksTable}.pages as pages`,
        `${booksTable}.is_approved`,
        `${booksTable}.image_url as book_image_url`,
      ];

      const categorySelect = [`${categoriesTable}.name as category_name`];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."id") as "author_ids"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."name") as "author_names"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."is_approved") as "author_approvals"`),
      ];

      const readingsSelect = [
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."id") as "readingIds"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."started_at") as "reading_started_at_dates"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."ended_at") as "reading_ended_at_dates"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."rating") as "reading_ratings"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."comment") as "reading_comments"`),
      ];

      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM "${booksReadingsTable}" br
        WHERE br."user_book_id" = "${usersBooksTable}".id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_rating"`);

      rawEntity = await this.databaseClient<UserBookRawEntity>(usersBooksTable)
        .select([
          ...userBookSelect,
          ...bookSelect,
          ...authorsSelect,
          ...readingsSelect,
          ...categorySelect,
          latestRatingSelect,
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.book_id`, '=', `${usersBooksTable}.book_id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.author_id`);
        })
        .leftJoin(booksTable, (join) => {
          join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.book_id`);
        })
        .leftJoin(booksReadingsTable, (join) => {
          join.on(`${booksReadingsTable}.user_book_id`, '=', `${usersBooksTable}.id`);
        })
        .leftJoin(usersBooksCollectionsTable, (join) => {
          join.on(`${usersBooksCollectionsTable}.user_book_id`, '=', `${usersBooksTable}.id`);
        })
        .join(categoriesTable, (join) => {
          join.on(`${booksTable}.category_id`, '=', `${categoriesTable}.id`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${usersBooksTable}.id`, id);
          }

          if (title) {
            builder.where(`${booksTable}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`${usersBooksTable}.bookshelf_id`, bookshelfId);
          }

          if (bookId) {
            builder.where(`${usersBooksTable}.book_id`, bookId);
          }

          if (authorIds) {
            builder.whereIn(`${authorsTable}.id`, authorIds);
          }
        })
        .groupBy([`${usersBooksTable}.id`, `${booksTable}.id`, `${categoriesTable}.name`])
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
      const userBookSelect = [
        `${usersBooksTable}.id`,
        `${usersBooksTable}.image_url`,
        `${usersBooksTable}.status`,
        `${usersBooksTable}.is_favorite`,
        `${usersBooksTable}.bookshelf_id`,
        `${usersBooksTable}.created_at`,
      ];

      const bookSelect = [
        `${booksTable}.id as bookId`,
        `${booksTable}.title as title`,
        `${booksTable}.category_id as category_id`,
        `${booksTable}.isbn as isbn`,
        `${booksTable}.publisher as publisher`,
        `${booksTable}.release_year as release_year`,
        `${booksTable}.language as language`,
        `${booksTable}.translator as translator`,
        `${booksTable}.format as format`,
        `${booksTable}.pages as pages`,
        `${booksTable}.is_approved`,
        `${booksTable}.image_url as book_image_url`,
      ];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."id") as "author_ids"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."name") as "author_names"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."is_approved") as "author_approvals"`),
      ];

      const categorySelect = [`${categoriesTable}.name as category_name`];

      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM "${booksReadingsTable}" br
        WHERE br."user_book_id" = "${usersBooksTable}".id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_rating"`);

      const latestReadingDateSelect = this.databaseClient.raw(`(
        SELECT br."ended_at"
        FROM "${booksReadingsTable}" br
        WHERE br."user_book_id" = "${usersBooksTable}".id
        ORDER BY br."ended_at" DESC
        LIMIT 1
      ) as "latest_reading_date"`);

      const readingsCountSubquery = this.databaseClient
        .select('user_book_id')
        .count('* as count')
        .from(booksReadingsTable)
        .groupBy('user_book_id')
        .as('readings_counts');

      const query = this.databaseClient<UserBookRawEntity>(usersBooksTable)
        .select([
          ...userBookSelect,
          ...bookSelect,
          ...authorsSelect,
          latestRatingSelect,
          ...(sortField === 'readingDate' ? [latestReadingDateSelect] : []),
          ...categorySelect,
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.book_id`, '=', `${usersBooksTable}.book_id`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.author_id`);
        })
        .leftJoin(booksTable, (join) => {
          join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.book_id`);
        })
        .join(categoriesTable, (join) => {
          join.on(`${booksTable}.category_id`, '=', `${categoriesTable}.id`);
        });

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readings_counts.user_book_id', `${usersBooksTable}.id`)
          .where('readings_counts.count', '>', 0);
      }

      if (userId) {
        query.leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${usersBooksTable}.bookshelf_id`);
        });
      }

      if (bookId) {
        query.where(`${usersBooksTable}.book_id`, bookId);
      }

      if (authorId) {
        query.where(`${booksAuthorsTable}.author_id`, authorId);
      }

      if (isbn) {
        query.where(`${booksTable}.isbn`, isbn);
      }

      if (title) {
        query.whereRaw(`${booksTable}.title ILIKE ?`, `%${title}%`);
      }

      if (status) {
        query.where(`${usersBooksTable}.status`, status);
      }

      if (isFavorite !== undefined) {
        query.where(`${usersBooksTable}.is_favorite`, isFavorite);
      }

      if (bookshelfId) {
        query.where(`${usersBooksTable}.bookshelf_id`, bookshelfId);
      }

      if (categoryId) {
        query.where(`${booksTable}.category_id`, categoryId);
      }

      if (userId) {
        query.where(`${bookshelvesTable}.user_id`, userId);
      }

      if (releaseYearAfter !== undefined) {
        query.where(`${booksTable}.release_year`, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(`${booksTable}.release_year`, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(`${booksTable}.language`, '=', language);
      }

      query.groupBy([`${usersBooksTable}.id`, `${booksTable}.id`, `${categoriesTable}.name`]);

      if (sortField === 'releaseYear') {
        query.orderBy(`${booksTable}.release_year`, sortOrder ?? 'desc');
      } else if (sortField === 'rating') {
        query.orderBy('latest_rating', sortOrder ?? 'desc', 'last');
      } else if (sortField === 'readingDate') {
        query.orderBy('latest_reading_date', sortOrder ?? 'desc', 'last');
      } else {
        query.orderBy('id', sortOrder ?? 'desc');
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
      const result = await this.databaseClient(usersBooksTable)
        .select([`${bookshelvesTable}.user_id as user_id`])
        .leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${usersBooksTable}.bookshelf_id`);
        })
        .where(`${usersBooksTable}.id`, id)
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
      await this.databaseClient<UserBookRawEntity>(usersBooksTable).delete().whereIn('id', ids);
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
        .from(booksReadingsTable)
        .groupBy('user_book_id')
        .as('readings_counts');

      const query = this.databaseClient<UserBookRawEntity>(usersBooksTable);

      if (authorId) {
        query
          .join(booksAuthorsTable, (join) => {
            join.on(`${booksAuthorsTable}.book_id`, '=', `${usersBooksTable}.book_id`);
          })
          .where(`${booksAuthorsTable}.author_id`, authorId);
      }

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readings_counts.user_book_id', `${usersBooksTable}.id`)
          .where('readings_counts.count', '>', 0);
      }

      if (isbn || title || releaseYearAfter !== undefined || releaseYearBefore !== undefined || language) {
        query.join(booksTable, (join) => {
          join.on(`${booksTable}.id`, '=', `${usersBooksTable}.book_id`);
        });
      }

      if (isbn) {
        query.where(`${booksTable}.isbn`, isbn);
      }

      if (title) {
        query.whereRaw(`${booksTable}.title ILIKE ?`, `%${title}%`);
      }

      if (releaseYearAfter !== undefined) {
        query.where(`${booksTable}.release_year`, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(`${booksTable}.release_year`, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(`${booksTable}.language`, language);
      }

      if (status) {
        query.where(`${usersBooksTable}.status`, status);
      }

      if (isFavorite !== undefined) {
        query.where(`${usersBooksTable}.is_favorite`, isFavorite);
      }

      if (bookId) {
        query.where(`${usersBooksTable}.book_id`, bookId);
      }

      if (bookshelfId) {
        query.where(`${usersBooksTable}.bookshelf_id`, bookshelfId);
      }

      if (categoryId) {
        query
          .leftJoin(booksTable, (join) => {
            join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.book_id`);
          })
          .where(`${booksTable}.category_id`, categoryId);
      }

      if (userId) {
        query
          .join(bookshelvesTable, (join) => {
            join.on(`${bookshelvesTable}.id`, '=', `${usersBooksTable}.bookshelf_id`);
          })
          .where(`${bookshelvesTable}.user_id`, userId);
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
