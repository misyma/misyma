import { UserBookExpandField } from '@common/contracts';

import { type UserBookMapper } from './userBookMapper/userBookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { bookshelfTable } from '../../../../bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
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
import { authorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import { bookAuthorTable } from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import { bookReadingTable } from '../../databases/bookDatabase/tables/bookReadingTable/bookReadingTable.js';
import { bookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { collectionTable } from '../../databases/bookDatabase/tables/collectionTable/collectionTable.js';
import { genreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';
import { type UserBookCollectionRawEntity } from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { userBookCollectionTable } from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookGenreRawEntity } from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import { userBookGenreTable } from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
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
      const userBookSelect = [
        `${userBookTable}.id`,
        `${userBookTable}.imageUrl`,
        `${userBookTable}.status`,
        `${userBookTable}.isFavorite`,
        `${userBookTable}.bookshelfId`,
        `${userBookTable}.createdAt`,
      ];

      const bookSelect = [
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
        `${bookTable}.createdAt as bookCreatedAt`,
      ];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg("${authorTable}"."id") as "authorIds"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."name") as "authorNames"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."isApproved") as "authorApprovals"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."createdAt") as "authorCreatedAtDates"`),
      ];

      const genresSelect = [
        this.databaseClient.raw(`array_agg("${genreTable}"."id") as "genreIds"`),
        this.databaseClient.raw(`array_agg("${genreTable}"."name") as "genreNames"`),
      ];

      const collectionsSelect = [
        this.databaseClient.raw(`array_agg("${collectionTable}"."id") as "collectionIds"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."name") as "collectionNames"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."createdAt") as "collectionCreatedAtDates"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."userId") as "collectionUserIds"`),
      ];

      const readingsSelect = [
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."id") as "readingIds"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."startedAt") as "readingStartedAtDates"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."endedAt") as "readingEndedAtDates"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."rating") as "readingRatings"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."comment") as "readingComments"`),
      ];

      rawEntities = await this.databaseClient<UserBookRawEntity>(userBookTable)
        .select([
          ...userBookSelect,
          ...bookSelect,
          ...authorsSelect,
          ...genresSelect,
          ...collectionsSelect,
          ...readingsSelect,
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${userBookTable}.bookId`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .leftJoin(userBookGenreTable, (join) => {
          join.on(`${userBookGenreTable}.userBookId`, '=', `${userBookTable}.id`);
        })
        .leftJoin(genreTable, (join) => {
          join.on(`${genreTable}.id`, `=`, `${userBookGenreTable}.genreId`);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${userBookTable}.bookId`);
        })
        .leftJoin(bookReadingTable, (join) => {
          join.on(`${bookReadingTable}.userBookId`, '=', `${userBookTable}.id`);
        })
        .leftJoin(userBookCollectionTable, (join) => {
          join.on(`${userBookCollectionTable}.userBookId`, '=', `${userBookTable}.id`);
        })
        .leftJoin(collectionTable, (join) => {
          join.on(`${collectionTable}.id`, '=', `${userBookCollectionTable}.collectionId`);
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

          if (authorIds) {
            builder.whereIn(`${authorTable}.id`, authorIds);
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
    const {
      bookshelfId,
      collectionId,
      userId,
      bookId,
      authorId,
      page,
      pageSize,
      isbn,
      title,
      status,
      isFavorite,
      sortDate,
      language,
      releaseAfter,
      expandFields,
    } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const userBookSelect = [
        `${userBookTable}.id`,
        `${userBookTable}.imageUrl`,
        `${userBookTable}.status`,
        `${userBookTable}.isFavorite`,
        `${userBookTable}.bookshelfId`,
        `${userBookTable}.createdAt`,
      ];

      const bookSelect = [
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
        `${bookTable}.createdAt as bookCreatedAt`,
      ];

      const authorsSelect = [
        this.databaseClient.raw(`array_agg("${authorTable}"."id") as "authorIds"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."name") as "authorNames"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."isApproved") as "authorApprovals"`),
        this.databaseClient.raw(`array_agg("${authorTable}"."createdAt") as "authorCreatedAtDates"`),
      ];

      const genresSelect = [
        this.databaseClient.raw(`array_agg("${genreTable}"."id") as "genreIds"`),
        this.databaseClient.raw(`array_agg("${genreTable}"."name") as "genreNames"`),
      ];

      const collectionsSelect = [
        this.databaseClient.raw(`array_agg("${collectionTable}"."id") as "collectionIds"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."name") as "collectionNames"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."createdAt") as "collectionCreatedAtDates"`),
        this.databaseClient.raw(`array_agg("${collectionTable}"."userId") as "collectionUserIds"`),
      ];

      const readingsSelect = [
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."id") as "readingIds"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."startedAt") as "readingStartedAtDates"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."endedAt") as "readingEndedAtDates"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."rating") as "readingRatings"`),
        this.databaseClient.raw(`array_agg("${bookReadingTable}"."comment") as "readingComments"`),
      ];

      const query = this.databaseClient<UserBookRawEntity>(userBookTable)
        .select([
          ...userBookSelect,
          ...bookSelect,
          ...authorsSelect,
          ...(expandFields.includes(UserBookExpandField.genres) ? genresSelect : []),
          ...(expandFields.includes(UserBookExpandField.collections) ? collectionsSelect : []),
          ...(expandFields.includes(UserBookExpandField.readings) ? readingsSelect : []),
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${userBookTable}.bookId`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${userBookTable}.bookId`);
        });

      if (expandFields.includes(UserBookExpandField.genres)) {
        query
          .leftJoin(userBookGenreTable, (join) => {
            join.on(`${userBookGenreTable}.userBookId`, '=', `${userBookTable}.id`);
          })
          .leftJoin(genreTable, (join) => {
            join.on(`${genreTable}.id`, `=`, `${userBookGenreTable}.genreId`);
          });
      }

      if (expandFields.includes(UserBookExpandField.readings)) {
        query.leftJoin(bookReadingTable, (join) => {
          join.on(`${bookReadingTable}.userBookId`, '=', `${userBookTable}.id`);
        });
      }

      if (expandFields.includes(UserBookExpandField.collections) || collectionId) {
        query
          .leftJoin(userBookCollectionTable, (join) => {
            join.on(`${userBookCollectionTable}.userBookId`, '=', `${userBookTable}.id`);
          })
          .leftJoin(collectionTable, (join) => {
            join.on(`${collectionTable}.id`, '=', `${userBookCollectionTable}.collectionId`);
          });
      }

      if (userId) {
        query.leftJoin(bookshelfTable, (join) => {
          join.on(`${bookshelfTable}.id`, `=`, `${userBookTable}.bookshelfId`);
        });
      }

      query.groupBy([`${userBookTable}.id`, `${bookTable}.id`]);

      if (bookId) {
        query.where(`${userBookTable}.bookId`, bookId);
      }

      if (authorId) {
        query.where(`${bookAuthorTable}.authorId`, authorId);
      }

      if (isbn) {
        query.where(`${bookTable}.isbn`, isbn);
      }

      if (title) {
        query.whereRaw(`${bookTable}.title ILIKE ?`, `%${title}%`);
      }

      if (status) {
        query.where(`${userBookTable}.status`, status);
      }

      if (isFavorite !== undefined) {
        query.where(`${userBookTable}.isFavorite`, isFavorite);
      }

      if (bookshelfId) {
        query.where(`${userBookTable}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query.where(`${collectionTable}.id`, collectionId);
      }

      if (userId) {
        query.where(`${bookshelfTable}.userId`, userId);
      }

      if (pageSize && page) {
        query.limit(pageSize).offset(pageSize * (page - 1));
      }

      if (releaseAfter) {
        query.where(`${bookTable}."createdAt`, '>=', releaseAfter);
      }

      if (language) {
        query.where(`${bookTable}."language"`, '=', language);
      }

      query.orderBy('id', sortDate ?? 'desc');

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }

    return this.userBookMapper.mapRawWithJoinsToDomain(rawEntities);
  }

  public async findUserBookOwner(payload: FindUserBookOwnerPayload): Promise<FindUserBookOwnerResult> {
    const { id } = payload;

    try {
      const result = await this.databaseClient(userBookTable)
        .select([`${bookshelfTable}.userId as userId`])
        .leftJoin(bookshelfTable, (join) => {
          join.on(`${bookshelfTable}.id`, `=`, `${userBookTable}.bookshelfId`);
        })
        .where(`${userBookTable}.id`, id)
        .first();

      if (!result) {
        return { userId: undefined };
      }

      return { userId: result.userId };
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'findOwner',
        error,
      });
    }
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
    const { bookshelfId, collectionId, userId, authorId, bookId, isbn, title, status, isFavorite } = payload;

    try {
      const query = this.databaseClient<UserBookRawEntity>(userBookTable);

      if (authorId) {
        query
          .join(bookAuthorTable, (join) => {
            join.on(`${bookAuthorTable}.bookId`, '=', `${userBookTable}.bookId`);
          })
          .where(`${bookAuthorTable}.authorId`, authorId);
      }

      if (isbn || title) {
        query.join(bookTable, (join) => {
          join.on(`${bookTable}.id`, '=', `${userBookTable}.bookId`);
        });
      }

      if (isbn) {
        query.where(`${bookTable}.isbn`, isbn);
      }

      if (title) {
        query.whereRaw(`${bookTable}.title ILIKE ?`, `%${title}%`);
      }

      if (status) {
        query.where(`${userBookTable}.status`, status);
      }

      if (isFavorite !== undefined) {
        query.where(`${userBookTable}.isFavorite`, isFavorite);
      }

      if (bookId) {
        query.where(`${userBookTable}.bookId`, bookId);
      }

      if (bookshelfId) {
        query.where(`${userBookTable}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query
          .join(userBookCollectionTable, (join) => {
            join.on(`${userBookCollectionTable}.userBookId`, '=', `${userBookTable}.id`);
          })
          .where(`${userBookCollectionTable}.collectionId`, collectionId);
      }

      if (userId) {
        query
          .join(bookshelfTable, (join) => {
            join.on(`${bookshelfTable}.id`, '=', `${userBookTable}.bookshelfId`);
          })
          .where(`${bookshelfTable}.userId`, userId);
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
