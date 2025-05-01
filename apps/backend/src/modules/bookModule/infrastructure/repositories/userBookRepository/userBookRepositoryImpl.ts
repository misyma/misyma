import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorTable/authorTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorTable.js';
import { booksReadingsTable } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/bookTable/bookTable.js';
import { categoriesTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { collectionsTable } from '../../../../databaseModule/infrastructure/tables/collectionTable/collectionTable.js';
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
            imageUrl: imageUrl ?? undefined,
            status,
            isFavorite,
            bookshelfId,
            bookId,
            createdAt,
          },
          '*',
        );

        if (collections?.length) {
          await transaction.batchInsert<UserBookCollectionRawEntity>(
            usersBooksCollectionsTable,
            collections.map((collection) => ({
              userBookId: id,
              collectionId: collection.getId(),
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
        const { collections: updatedCollections } = userBook.getState();

        await transaction<UserBookRawEntity>(usersBooksTable)
          .update({
            bookshelfId,
            status,
            isFavorite,
            imageUrl,
          })
          .where({ id: userBook.id });

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
                userBookId: userBook.id,
                collectionId: collection.getId(),
              })),
            )
            .onConflict(['userBookId', 'collectionId'])
            .merge();
        }

        if (removedCollections.length > 0) {
          await transaction<UserBookCollectionRawEntity>(usersBooksCollectionsTable)
            .delete()
            .whereIn(
              'collectionId',
              removedCollections.map((collection) => collection.getId()),
            )
            .andWhere({
              userBookId: userBook.id,
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
      imageUrl: userBook.imageUrl,
      status: userBook.status,
      isFavorite: userBook.isFavorite,
      bookshelfId: userBook.bookshelfId,
      bookId: userBook.bookId,
      createdAt: userBook.createdAt,
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
        `${usersBooksTable}.imageUrl`,
        `${usersBooksTable}.status`,
        `${usersBooksTable}.isFavorite`,
        `${usersBooksTable}.bookshelfId`,
        `${usersBooksTable}.createdAt`,
      ];

      const bookSelect = [
        `${booksTable}.id as bookId`,
        `${booksTable}.title as title`,
        `${booksTable}.categoryId as categoryId`,
        `${booksTable}.isbn as isbn`,
        `${booksTable}.publisher as publisher`,
        `${booksTable}.releaseYear as releaseYear`,
        `${booksTable}.language as language`,
        `${booksTable}.translator as translator`,
        `${booksTable}.format as format`,
        `${booksTable}.pages as pages`,
        `${booksTable}.isApproved`,
        `${booksTable}.imageUrl as bookImageUrl`,
        `${booksTable}.createdAt as bookCreatedAt`,
      ];

      const categorySelect = [`${categoriesTable}.name as categoryName`];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."id") as "authorIds"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."name") as "authorNames"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."isApproved") as "authorApprovals"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."createdAt") as "authorCreatedAtDates"`),
      ];

      const collectionsSelect = [
        this.databaseClient.raw(`array_agg(DISTINCT "${collectionsTable}"."id") as "collectionIds"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${collectionsTable}"."name") as "collectionNames"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${collectionsTable}"."createdAt") as "collectionCreatedAtDates"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${collectionsTable}"."userId") as "collectionUserIds"`),
      ];

      const readingsSelect = [
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."id") as "readingIds"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."startedAt") as "readingStartedAtDates"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."endedAt") as "readingEndedAtDates"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."rating") as "readingRatings"`),
        this.databaseClient.raw(`array_agg("${booksReadingsTable}"."comment") as "readingComments"`),
      ];

      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM "${booksReadingsTable}" br
        WHERE br."userBookId" = "${usersBooksTable}".id
        ORDER BY br."endedAt" DESC
        LIMIT 1
      ) as "latestRating"`);

      rawEntity = await this.databaseClient<UserBookRawEntity>(usersBooksTable)
        .select([
          ...userBookSelect,
          ...bookSelect,
          ...authorsSelect,
          ...collectionsSelect,
          ...readingsSelect,
          ...categorySelect,
          latestRatingSelect,
        ])
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.bookId`, '=', `${usersBooksTable}.bookId`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .leftJoin(booksTable, (join) => {
          join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.bookId`);
        })
        .leftJoin(booksReadingsTable, (join) => {
          join.on(`${booksReadingsTable}.userBookId`, '=', `${usersBooksTable}.id`);
        })
        .leftJoin(usersBooksCollectionsTable, (join) => {
          join.on(`${usersBooksCollectionsTable}.userBookId`, '=', `${usersBooksTable}.id`);
        })
        .leftJoin(collectionsTable, (join) => {
          join.on(`${collectionsTable}.id`, '=', `${usersBooksCollectionsTable}.collectionId`);
        })
        .join(categoriesTable, (join) => {
          join.on(`${booksTable}.categoryId`, '=', `${categoriesTable}.id`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${usersBooksTable}.id`, id);
          }

          if (title) {
            builder.where(`${booksTable}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`${usersBooksTable}.bookshelfId`, bookshelfId);
          }

          if (bookId) {
            builder.where(`${usersBooksTable}.bookId`, bookId);
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
      collectionId,
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
        `${usersBooksTable}.imageUrl`,
        `${usersBooksTable}.status`,
        `${usersBooksTable}.isFavorite`,
        `${usersBooksTable}.bookshelfId`,
        `${usersBooksTable}.createdAt`,
      ];

      const bookSelect = [
        `${booksTable}.id as bookId`,
        `${booksTable}.title as title`,
        `${booksTable}.categoryId as categoryId`,
        `${booksTable}.isbn as isbn`,
        `${booksTable}.publisher as publisher`,
        `${booksTable}.releaseYear as releaseYear`,
        `${booksTable}.language as language`,
        `${booksTable}.translator as translator`,
        `${booksTable}.format as format`,
        `${booksTable}.pages as pages`,
        `${booksTable}.isApproved`,
        `${booksTable}.imageUrl as bookImageUrl`,
        `${booksTable}.createdAt as bookCreatedAt`,
      ];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."id") as "authorIds"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."name") as "authorNames"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."isApproved") as "authorApprovals"`),
        this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."createdAt") as "authorCreatedAtDates"`),
      ];

      const categorySelect = [`${categoriesTable}.name as categoryName`];

      const latestRatingSelect = this.databaseClient.raw(`(
        SELECT br.rating
        FROM "${booksReadingsTable}" br
        WHERE br."userBookId" = "${usersBooksTable}".id
        ORDER BY br."endedAt" DESC
        LIMIT 1
      ) as "latestRating"`);

      const latestReadingDateSelect = this.databaseClient.raw(`(
        SELECT br."endedAt"
        FROM "${booksReadingsTable}" br
        WHERE br."userBookId" = "${usersBooksTable}".id
        ORDER BY br."endedAt" DESC
        LIMIT 1
      ) as "latestReadingDate"`);

      const readingsCountSubquery = this.databaseClient
        .select('userBookId')
        .count('* as count')
        .from(booksReadingsTable)
        .groupBy('userBookId')
        .as('readingsCounts');

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
          join.on(`${booksAuthorsTable}.bookId`, '=', `${usersBooksTable}.bookId`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .leftJoin(booksTable, (join) => {
          join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.bookId`);
        })
        .join(categoriesTable, (join) => {
          join.on(`${booksTable}.categoryId`, '=', `${categoriesTable}.id`);
        });

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readingsCounts.userBookId', `${usersBooksTable}.id`)
          .where('readingsCounts.count', '>', 0);
      }

      if (collectionId) {
        query
          .leftJoin(usersBooksCollectionsTable, (join) => {
            join.on(`${usersBooksCollectionsTable}.userBookId`, '=', `${usersBooksTable}.id`);
          })
          .leftJoin(collectionsTable, (join) => {
            join.on(`${collectionsTable}.id`, '=', `${usersBooksCollectionsTable}.collectionId`);
          });
      }

      if (userId) {
        query.leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${usersBooksTable}.bookshelfId`);
        });
      }

      if (bookId) {
        query.where(`${usersBooksTable}.bookId`, bookId);
      }

      if (authorId) {
        query.where(`${booksAuthorsTable}.authorId`, authorId);
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
        query.where(`${usersBooksTable}.isFavorite`, isFavorite);
      }

      if (bookshelfId) {
        query.where(`${usersBooksTable}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query.where(`${collectionsTable}.id`, collectionId);
      }

      if (categoryId) {
        query.where(`${booksTable}.categoryId`, categoryId);
      }

      if (userId) {
        query.where(`${bookshelvesTable}.userId`, userId);
      }

      if (releaseYearAfter !== undefined) {
        query.where(`${booksTable}.releaseYear`, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(`${booksTable}.releaseYear`, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(`${booksTable}.language`, '=', language);
      }

      query.groupBy([`${usersBooksTable}.id`, `${booksTable}.id`, `${categoriesTable}.name`]);

      if (sortField === 'releaseYear') {
        query.orderBy(`${booksTable}.releaseYear`, sortOrder ?? 'desc');
      } else if (sortField === 'rating') {
        query.orderBy('latestRating', sortOrder ?? 'desc', 'last');
      } else if (sortField === 'readingDate') {
        query.orderBy('latestReadingDate', sortOrder ?? 'desc', 'last');
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
        .select([`${bookshelvesTable}.userId as userId`])
        .leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${usersBooksTable}.bookshelfId`);
        })
        .where(`${usersBooksTable}.id`, id)
        .first();

      if (!result) {
        return { userId: undefined };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return { userId: result.userId };
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
      collectionId,
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
        .select('userBookId')
        .count('* as count')
        .from(booksReadingsTable)
        .groupBy('userBookId')
        .as('readingsCounts');

      const query = this.databaseClient<UserBookRawEntity>(usersBooksTable);

      if (authorId) {
        query
          .join(booksAuthorsTable, (join) => {
            join.on(`${booksAuthorsTable}.bookId`, '=', `${usersBooksTable}.bookId`);
          })
          .where(`${booksAuthorsTable}.authorId`, authorId);
      }

      if (isRated) {
        query
          .leftJoin(readingsCountSubquery, 'readingsCounts.userBookId', `${usersBooksTable}.id`)
          .where('readingsCounts.count', '>', 0);
      }

      if (isbn || title || releaseYearAfter !== undefined || releaseYearBefore !== undefined || language) {
        query.join(booksTable, (join) => {
          join.on(`${booksTable}.id`, '=', `${usersBooksTable}.bookId`);
        });
      }

      if (isbn) {
        query.where(`${booksTable}.isbn`, isbn);
      }

      if (title) {
        query.whereRaw(`${booksTable}.title ILIKE ?`, `%${title}%`);
      }

      if (releaseYearAfter !== undefined) {
        query.where(`${booksTable}.releaseYear`, '>=', releaseYearAfter);
      }

      if (releaseYearBefore !== undefined) {
        query.where(`${booksTable}.releaseYear`, '<=', releaseYearBefore);
      }

      if (language) {
        query.where(`${booksTable}.language`, language);
      }

      if (status) {
        query.where(`${usersBooksTable}.status`, status);
      }

      if (isFavorite !== undefined) {
        query.where(`${usersBooksTable}.isFavorite`, isFavorite);
      }

      if (bookId) {
        query.where(`${usersBooksTable}.bookId`, bookId);
      }

      if (bookshelfId) {
        query.where(`${usersBooksTable}.bookshelfId`, bookshelfId);
      }

      if (categoryId) {
        query
          .leftJoin(booksTable, (join) => {
            join.on(`${booksTable}.id`, `=`, `${usersBooksTable}.bookId`);
          })
          .where(`${booksTable}.categoryId`, categoryId);
      }

      if (collectionId) {
        query
          .join(usersBooksCollectionsTable, (join) => {
            join.on(`${usersBooksCollectionsTable}.userBookId`, '=', `${usersBooksTable}.id`);
          })
          .where(`${usersBooksCollectionsTable}.collectionId`, collectionId);
      }

      if (userId) {
        query
          .join(bookshelvesTable, (join) => {
            join.on(`${bookshelvesTable}.id`, '=', `${usersBooksTable}.bookshelfId`);
          })
          .where(`${bookshelvesTable}.userId`, userId);
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
