import { type UserBookMapper } from './userBookMapper/userBookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import {
  bookshelfColumns,
  bookshelfTable,
} from '../../../../bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { UserBook, type UserBookState } from '../../../domain/entities/userBook/userBook.js';
import {
  type SaveUserBooksPayload,
  type DeleteUserBooksPayload,
  type FindUserBookPayload,
  type FindUserBooksPayload,
  type SaveUserBookPayload,
  type UserBookRepository,
  type FindUserBooksByUserPayload,
  type CountUserBooksPayload,
} from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { authorColumns, authorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import {
  bookAuthorColumns,
  bookAuthorTable,
} from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import {
  bookReadingColumns,
  bookReadingTable,
} from '../../databases/bookDatabase/tables/bookReadingTable/bookReadingTable.js';
import { bookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import {
  collectionColumns,
  collectionTable,
} from '../../databases/bookDatabase/tables/collectionTable/collectionTable.js';
import { genreColumns, genreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';
import { type UserBookCollectionRawEntity } from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import {
  userBookCollectionColumns,
  userBookCollectionTable,
} from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookGenreRawEntity } from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import {
  userBookGenreColumns,
  userBookGenreTable,
} from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
import { type UserBookRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { userBookTable } from '../../databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { type UserBookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

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
      userBook: { imageUrl, status, isFavorite, bookshelfId, bookId, genres, collections, createdAt },
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<UserBookRawEntity>(userBookTable).insert(
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

        if (genres.length) {
          await transaction.batchInsert<UserBookGenreRawEntity>(
            userBookGenreTable,
            genres.map((genre) => ({
              userBookId: id,
              genreId: genre.getId(),
            })),
          );
        }

        if (collections.length) {
          await transaction.batchInsert<UserBookCollectionRawEntity>(
            userBookCollectionTable,
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
        error,
      });
    }

    return (await this.findUserBook({ id })) as UserBook;
  }

  private async updateUserBook(payload: UpdateUserBookPayload): Promise<UserBook> {
    const { userBook } = payload;

    const existingUserBook = await this.findUserBook({ id: userBook.getId() });

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
        const { genres: updatedGenres, collections: updatedCollections } = userBook.getState();

        await transaction<UserBookRawEntity>(userBookTable)
          .update({
            bookshelfId,
            status,
            isFavorite,
            imageUrl,
          })
          .where({ id: userBook.getId() });

        const existingGenres = existingUserBook.getGenres();

        const addedGenres = updatedGenres.filter(
          (genre) => !existingGenres.some((currentGenre) => currentGenre.getId() === genre.getId()),
        );

        const removedGenres = existingGenres.filter(
          (genre) => !updatedGenres.some((currentGenre) => currentGenre.getId() === genre.getId()),
        );

        if (addedGenres.length > 0) {
          await transaction<UserBookGenreRawEntity>(userBookGenreTable)
            .insert(
              addedGenres.map((genre) => ({
                userBookId: userBook.getId(),
                genreId: genre.getId(),
              })),
            )
            .onConflict(['userBookId', 'genreId'])
            .merge();
        }

        if (removedGenres.length > 0) {
          await transaction<UserBookGenreRawEntity>(userBookGenreTable)
            .delete()
            .whereIn(
              'genreId',
              removedGenres.map((genre) => genre.getId()),
            )
            .andWhere({
              userBookId: userBook.getId(),
            });
        }

        const existingCollections = existingUserBook.getCollections();

        const addedCollections = updatedCollections.filter(
          (collection) =>
            !existingCollections.some((currentCollection) => currentCollection.getId() === collection.getId()),
        );

        const removedCollections = existingCollections.filter(
          (collection) =>
            !updatedCollections.some((currentCollection) => currentCollection.getId() === collection.getId()),
        );

        if (addedCollections.length > 0) {
          await transaction<UserBookCollectionRawEntity>(userBookCollectionTable)
            .insert(
              addedCollections.map((collection) => ({
                userBookId: userBook.getId(),
                collectionId: collection.getId(),
              })),
            )
            .onConflict(['userBookId', 'collectionId'])
            .merge();
        }

        if (removedCollections.length > 0) {
          await transaction<UserBookCollectionRawEntity>(userBookCollectionTable)
            .delete()
            .whereIn(
              'genreId',
              removedCollections.map((collection) => collection.getId()),
            )
            .andWhere({
              userBookId: userBook.getId(),
            });
        }
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'update',
        error,
      });
    }

    return (await this.findUserBook({ id: userBook.getId() })) as UserBook;
  }

  public async saveUserBooks(payload: SaveUserBooksPayload): Promise<void> {
    const { userBooks } = payload;

    const payloads: Partial<UserBookRawEntity>[] = userBooks.map((userBook) => ({
      id: userBook.getId(),
      imageUrl: userBook.getImageUrl(),
      status: userBook.getStatus(),
      isFavorite: userBook.getIsFavorite(),
      bookshelfId: userBook.getBookshelfId(),
      bookId: userBook.getBookId(),
      createdAt: userBook.getCreatedAt(),
    }));

    try {
      await this.databaseClient<UserBookRawEntity>(userBookTable).insert(payloads).onConflict('id').merge();
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'save',
        error,
      });
    }
  }

  public async findUserBook(payload: FindUserBookPayload): Promise<UserBook | null> {
    const { id, title, bookshelfId, bookId, authorIds } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<UserBookRawEntity>(userBookTable)
        .select([
          `${userBookTable}.id`,
          `${userBookTable}.imageUrl`,
          `${userBookTable}.status`,
          `${userBookTable}.isFavorite`,
          `${userBookTable}.bookshelfId`,
          `${userBookTable}.createdAt`,

          `${bookTable}.id as bookId`,
          `${bookTable}.title as title`,
          `${bookTable}.isbn as isbn`,
          `${bookTable}.publisher as publisher`,
          `${bookTable}.releaseYear as releaseYear`,
          `${bookTable}.language as language`,
          `${bookTable}.translator as translator`,
          `${bookTable}.format as format`,
          `${bookTable}.pages as pages`,
          `${bookTable}.isApproved`,
          `${bookTable}.imageUrl as bookImageUrl`,

          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),

          this.databaseClient.raw(`array_agg("genres"."id") as "genreIds"`),
          this.databaseClient.raw(`array_agg("genres"."name") as "genreNames"`),

          this.databaseClient.raw(`array_agg("collections"."id") as "collectionIds"`),
          this.databaseClient.raw(`array_agg("collections"."name") as "collectionNames"`),
          this.databaseClient.raw(`array_agg("collections"."createdAt") as "collectionCreatedAtDates"`),
          this.databaseClient.raw(`array_agg("collections"."userId") as "collectionUserIds"`),

          this.databaseClient.raw(`array_agg("bookReadings"."id") as "readingIds"`),
          this.databaseClient.raw(`array_agg("bookReadings"."startedAt") as "readingStartedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."endedAt") as "readingEndedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."rating") as "readingRatings"`),
          this.databaseClient.raw(`array_agg("bookReadings"."comment") as "readingComments"`),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(bookAuthorColumns.bookId, '=', `${userBookTable}.bookId`);

          if (authorIds) {
            join.andOnIn(bookAuthorColumns.authorId, this.databaseClient.raw('?', [authorIds.join(',')]));
          }
        })
        .leftJoin(authorTable, (join) => {
          join.on(authorColumns.id, '=', bookAuthorColumns.authorId);
        })
        .leftJoin(userBookGenreTable, (join) => {
          join.on(userBookGenreColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(genreTable, (join) => {
          join.on(genreColumns.id, `=`, userBookGenreColumns.genreId);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${userBookTable}.bookId`);
        })
        .leftJoin(bookReadingTable, (join) => {
          join.on(bookReadingColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(userBookCollectionTable, (join) => {
          join.on(userBookCollectionColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(collectionTable, (join) => {
          join.on(collectionColumns.id, `=`, userBookCollectionColumns.collectionId);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${userBookTable}.id`, id);
          }

          if (title) {
            builder.where(`${bookTable}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`${userBookTable}.bookshelfId`, bookshelfId);
          }

          if (bookId) {
            builder.where(`${userBookTable}.bookId`, bookId);
          }
        })
        .groupBy([`${userBookTable}.id`, `${bookTable}.id`]);
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'find',
        error,
      });
    }

    if (!rawEntities.length) {
      return null;
    }

    return this.userBookMapper.mapRawWithJoinsToDomain(rawEntities)[0] as UserBook;
  }

  public async findUserBooks(payload: FindUserBooksPayload): Promise<UserBook[]> {
    const { bookshelfId, collectionId, ids, page, pageSize, isbn, sortDate } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<UserBookRawEntity>(userBookTable)
        .select([
          `${userBookTable}.id`,
          `${userBookTable}.imageUrl`,
          `${userBookTable}.status`,
          `${userBookTable}.isFavorite`,
          `${userBookTable}.bookshelfId`,
          `${userBookTable}.createdAt`,

          `${bookTable}.id as bookId`,
          `${bookTable}.title as title`,
          `${bookTable}.isbn as isbn`,
          `${bookTable}.publisher as publisher`,
          `${bookTable}.releaseYear as releaseYear`,
          `${bookTable}.language as language`,
          `${bookTable}.translator as translator`,
          `${bookTable}.format as format`,
          `${bookTable}.pages as pages`,
          `${bookTable}.isApproved`,
          `${bookTable}.imageUrl as bookImageUrl`,

          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),

          this.databaseClient.raw(`array_agg("genres"."id") as "genreIds"`),
          this.databaseClient.raw(`array_agg("genres"."name") as "genreNames"`),

          this.databaseClient.raw(`array_agg("collections"."id") as "collectionIds"`),
          this.databaseClient.raw(`array_agg("collections"."name") as "collectionNames"`),
          this.databaseClient.raw(`array_agg("collections"."createdAt") as "collectionCreatedAtDates"`),
          this.databaseClient.raw(`array_agg("collections"."userId") as "collectionUserIds"`),

          this.databaseClient.raw(`array_agg("bookReadings"."id") as "readingIds"`),
          this.databaseClient.raw(`array_agg("bookReadings"."startedAt") as "readingStartedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."endedAt") as "readingEndedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."rating") as "readingRatings"`),
          this.databaseClient.raw(`array_agg("bookReadings"."comment") as "readingComments"`),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(bookAuthorColumns.bookId, '=', `${userBookTable}.bookId`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(authorColumns.id, '=', bookAuthorColumns.authorId);
        })
        .leftJoin(userBookGenreTable, (join) => {
          join.on(userBookGenreColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(genreTable, (join) => {
          join.on(genreColumns.id, `=`, userBookGenreColumns.genreId);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${userBookTable}.bookId`);
        })
        .leftJoin(bookReadingTable, (join) => {
          join.on(bookReadingColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(userBookCollectionTable, (join) => {
          join.on(userBookCollectionColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(collectionTable, (join) => {
          join.on(collectionColumns.id, `=`, userBookCollectionColumns.collectionId);
        })
        .groupBy([`${userBookTable}.id`, `${bookTable}.id`]);

      if (ids && ids.length > 0) {
        query.whereIn(`${userBookTable}.id`, ids);
      }

      if (isbn) {
        query.where(`${bookTable}.isbn`, isbn);
      }

      if (bookshelfId) {
        query.where(`${userBookTable}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query.where(collectionColumns.id, collectionId);
      }

      if (pageSize && page) {
        query.limit(pageSize).offset(pageSize * (page - 1));
      }

      if (sortDate) {
        query.orderBy('createdAt', sortDate);
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }

    return this.userBookMapper.mapRawWithJoinsToDomain(rawEntities) as UserBook[];
  }

  public async findUserBooksByUser(payload: FindUserBooksByUserPayload): Promise<UserBook[]> {
    const { userId, bookIdentifier, page, pageSize, sortDate } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<UserBookRawEntity>(userBookTable)
        .select([
          `${userBookTable}.id`,
          `${userBookTable}.imageUrl`,
          `${userBookTable}.status`,
          `${userBookTable}.isFavorite`,
          `${userBookTable}.bookshelfId`,
          `${userBookTable}.createdAt`,

          `${bookTable}.id as bookId`,
          `${bookTable}.title as title`,
          `${bookTable}.isbn as isbn`,
          `${bookTable}.publisher as publisher`,
          `${bookTable}.releaseYear as releaseYear`,
          `${bookTable}.language as language`,
          `${bookTable}.translator as translator`,
          `${bookTable}.format as format`,
          `${bookTable}.pages as pages`,
          `${bookTable}.isApproved`,
          `${bookTable}.imageUrl as bookImageUrl`,

          this.databaseClient.raw(`array_agg("authors"."id") as "authorIds"`),
          this.databaseClient.raw(`array_agg("authors"."name") as "authorNames"`),
          this.databaseClient.raw(`array_agg("authors"."isApproved") as "authorApprovals"`),

          this.databaseClient.raw(`array_agg("genres"."id") as "genreIds"`),
          this.databaseClient.raw(`array_agg("genres"."name") as "genreNames"`),

          this.databaseClient.raw(`array_agg("collections"."id") as "collectionIds"`),
          this.databaseClient.raw(`array_agg("collections"."name") as "collectionNames"`),
          this.databaseClient.raw(`array_agg("collections"."createdAt") as "collectionCreatedAtDates"`),
          this.databaseClient.raw(`array_agg("collections"."userId") as "collectionUserIds"`),

          this.databaseClient.raw(`array_agg("bookReadings"."id") as "readingIds"`),
          this.databaseClient.raw(`array_agg("bookReadings"."startedAt") as "readingStartedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."endedAt") as "readingEndedAtDates"`),
          this.databaseClient.raw(`array_agg("bookReadings"."rating") as "readingRatings"`),
          this.databaseClient.raw(`array_agg("bookReadings"."comment") as "readingComments"`),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(bookAuthorColumns.bookId, '=', `${userBookTable}.bookId`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(authorColumns.id, '=', bookAuthorColumns.authorId);
        })
        .leftJoin(userBookGenreTable, (join) => {
          join.on(userBookGenreColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(genreTable, (join) => {
          join.on(genreColumns.id, `=`, userBookGenreColumns.genreId);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${userBookTable}.bookId`);
        })
        .leftJoin(bookshelfTable, (join) => {
          join.on(bookshelfColumns.id, `=`, `${userBookTable}.bookshelfId`);
        })
        .leftJoin(bookReadingTable, (join) => {
          join.on(bookReadingColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(userBookCollectionTable, (join) => {
          join.on(userBookCollectionColumns.userBookId, '=', `${userBookTable}.id`);
        })
        .leftJoin(collectionTable, (join) => {
          join.on(collectionColumns.id, `=`, userBookCollectionColumns.collectionId);
        })
        .groupBy([`${userBookTable}.id`, `${bookTable}.id`]);

      if (bookIdentifier) {
        query.where(`${userBookTable}.bookId`, bookIdentifier.id);

        if (bookIdentifier.isbn) {
          query.orWhere(`${bookTable}.isbn`, bookIdentifier.isbn);
        }
      }

      query.where(`${bookshelfTable}.userId`, userId);

      if (sortDate) {
        query.orderBy('createdAt', sortDate);
      }

      rawEntities = await query.limit(pageSize).offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }

    return this.userBookMapper.mapRawWithJoinsToDomain(rawEntities) as UserBook[];
  }

  public async deleteUserBooks(payload: DeleteUserBooksPayload): Promise<void> {
    const { ids } = payload;

    try {
      await this.databaseClient<UserBookRawEntity>(userBookTable).delete().whereIn('id', ids);
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'delete',
        error,
      });
    }
  }

  public async countUserBooks(payload: CountUserBooksPayload): Promise<number> {
    const { bookshelfId, ids, collectionId } = payload;

    try {
      const query = this.databaseClient<UserBookRawEntity>(userBookTable);

      if (ids && ids.length > 0) {
        query.whereIn(`${userBookTable}.id`, ids);
      }

      if (bookshelfId) {
        query.where(`${userBookTable}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query
          .join(userBookCollectionTable, (join) => {
            join.on(userBookCollectionColumns.userBookId, '=', `${userBookTable}.id`);
          })
          .where(userBookCollectionColumns.collectionId, collectionId);
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
        error,
      });
    }
  }
}
