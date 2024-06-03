import { type UserBookMapper } from './userBookMapper/userBookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { BookshelfTable } from '../../../../bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { UserBook, type UserBookState } from '../../../domain/entities/userBook/userBook.js';
import {
  type SaveUserBooksPayload,
  type DeleteUserBooksPayload,
  type FindUserBookPayload,
  type FindUserBooksPayload,
  type SaveUserBookPayload,
  type UserBookRepository,
  type FindUserBooksByUserPayload,
} from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { AuthorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import { BookReadingTable } from '../../databases/bookDatabase/tables/bookReadingTable/bookReadingTable.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { CollectionTable } from '../../databases/bookDatabase/tables/collectionTable/collectionTable.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';
import { type UserBookCollectionRawEntity } from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { UserBookCollectionsTable } from '../../databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookGenreRawEntity } from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import { UserBookGenreTable } from '../../databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
import { type UserBookRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { UserBookTable } from '../../databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { type UserBookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

type CreateUserBookPayload = { userBook: UserBookState };

type UpdateUserBookPayload = { userBook: UserBook };

export class UserBookRepositoryImpl implements UserBookRepository {
  private readonly userBookTable = new UserBookTable();
  private readonly bookTable = new BookTable();
  private readonly bookshelfTable = new BookshelfTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();
  private readonly userBookGenresTable = new UserBookGenreTable();
  private readonly genresTable = new GenreTable();
  private readonly bookReadingTable = new BookReadingTable();
  private readonly collectionTable = new CollectionTable();
  private readonly userBookCollectionTable = new UserBookCollectionsTable();

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
      userBook: { imageUrl, status, isFavorite, bookshelfId, bookId, genres, collections },
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<UserBookRawEntity>(this.userBookTable.name).insert(
          {
            id,
            imageUrl: imageUrl ?? undefined,
            status,
            isFavorite,
            bookshelfId,
            bookId,
          },
          '*',
        );

        if (genres.length) {
          await transaction.batchInsert<UserBookGenreRawEntity>(
            this.userBookGenresTable.name,
            genres.map((genre) => ({
              userBookId: id,
              genreId: genre.getId(),
            })),
          );
        }

        if (collections.length) {
          await transaction.batchInsert<UserBookCollectionRawEntity>(
            this.userBookCollectionTable.name,
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

        await transaction<UserBookRawEntity>(this.userBookTable.name)
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
          await transaction<UserBookGenreRawEntity>(this.userBookGenresTable.name)
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
          await transaction<UserBookGenreRawEntity>(this.userBookGenresTable.name)
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
          await transaction<UserBookCollectionRawEntity>(this.userBookCollectionTable.name)
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
          await transaction<UserBookCollectionRawEntity>(this.userBookCollectionTable.name)
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

    const payloads = userBooks.map((userBook) => ({
      id: userBook.getId(),
      imageUrl: userBook.getImageUrl(),
      status: userBook.getStatus(),
      isFavorite: userBook.getIsFavorite(),
      bookshelfId: userBook.getBookshelfId(),
      bookId: userBook.getBookId(),
    }));

    try {
      await this.databaseClient<UserBookRawEntity>(this.userBookTable.name).insert(payloads).onConflict('id').merge();
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
      rawEntities = await this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
        .select([
          `${this.bookTable.name}.id as bookId`,
          `${this.bookTable.name}.title as title`,
          `${this.bookTable.name}.isbn as isbn`,
          `${this.bookTable.name}.publisher as publisher`,
          `${this.bookTable.name}.releaseYear as releaseYear`,
          `${this.bookTable.name}.language as language`,
          `${this.bookTable.name}.translator as translator`,
          `${this.bookTable.name}.format as format`,
          `${this.bookTable.name}.pages as pages`,
          `${this.bookTable.name}.isApproved`,
          `${this.bookTable.name}.imageUrl as bookImageUrl`,
          `${this.userBookTable.name}.id`,
          `${this.userBookTable.name}.imageUrl`,
          `${this.userBookTable.name}.status`,
          `${this.userBookTable.name}.isFavorite`,
          `${this.userBookTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          `${this.authorTable.name}.name as authorName`,
          `${this.authorTable.name}.isApproved as isAuthorApproved`,
          `${this.genresTable.name}.id as genreId`,
          `${this.genresTable.name}.name as genreName`,
          `${this.collectionTable.name}.id as collectionId`,
          `${this.collectionTable.name}.name as collectionName`,
          `${this.collectionTable.name}.userId as userId`,
          `${this.bookReadingTable.name}.id as readingId`,
          `${this.bookReadingTable.name}.startedAt as readingStartedAt`,
          `${this.bookReadingTable.name}.endedAt as readingEndedAt`,
          `${this.bookReadingTable.name}.rating as readingRating`,
          `${this.bookReadingTable.name}.comment as readingComment`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);

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
        .leftJoin(this.userBookGenresTable.name, (join) => {
          join.on(`${this.userBookGenresTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.userBookGenresTable.name}.genreId`);
        })
        .leftJoin(this.bookTable.name, (join) => {
          join.on(`${this.bookTable.name}.id`, `=`, `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.bookReadingTable.name, (join) => {
          join.on(`${this.bookReadingTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.userBookCollectionTable.name, (join) => {
          join.on(`${this.userBookCollectionTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.collectionTable.name, (join) => {
          join.on(`${this.collectionTable.name}.id`, `=`, `${this.userBookCollectionTable.name}.collectionId`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${this.userBookTable.name}.id`, id);
          }

          if (title) {
            builder.where(`${this.bookTable.name}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`${this.userBookTable.name}.bookshelfId`, bookshelfId);
          }

          if (bookId) {
            builder.where(`${this.userBookTable.name}.bookId`, bookId);
          }
        });
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
    const { bookshelfId, collectionId, ids, page, pageSize } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
        .select([
          `${this.bookTable.name}.id as bookId`,
          `${this.bookTable.name}.title as title`,
          `${this.bookTable.name}.isbn as isbn`,
          `${this.bookTable.name}.publisher as publisher`,
          `${this.bookTable.name}.releaseYear as releaseYear`,
          `${this.bookTable.name}.language as language`,
          `${this.bookTable.name}.translator as translator`,
          `${this.bookTable.name}.format as format`,
          `${this.bookTable.name}.pages as pages`,
          `${this.bookTable.name}.isApproved`,
          `${this.bookTable.name}.imageUrl as bookImageUrl`,
          `${this.userBookTable.name}.id`,
          `${this.userBookTable.name}.imageUrl`,
          `${this.userBookTable.name}.status`,
          `${this.userBookTable.name}.isFavorite`,
          `${this.userBookTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          `${this.authorTable.name}.name as authorName`,
          `${this.authorTable.name}.isApproved as isAuthorApproved`,
          `${this.genresTable.name}.id as genreId`,
          `${this.genresTable.name}.name as genreName`,
          `${this.collectionTable.name}.id as collectionId`,
          `${this.collectionTable.name}.name as collectionName`,
          `${this.collectionTable.name}.userId as userId`,
          `${this.bookReadingTable.name}.id as readingId`,
          `${this.bookReadingTable.name}.startedAt as readingStartedAt`,
          `${this.bookReadingTable.name}.endedAt as readingEndedAt`,
          `${this.bookReadingTable.name}.rating as readingRating`,
          `${this.bookReadingTable.name}.comment as readingComment`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.userBookGenresTable.name, (join) => {
          join.on(`${this.userBookGenresTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.userBookGenresTable.name}.genreId`);
        })
        .leftJoin(this.bookTable.name, (join) => {
          join.on(`${this.bookTable.name}.id`, `=`, `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.bookReadingTable.name, (join) => {
          join.on(`${this.bookReadingTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.userBookCollectionTable.name, (join) => {
          join.on(`${this.userBookCollectionTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.collectionTable.name, (join) => {
          join.on(`${this.collectionTable.name}.id`, `=`, `${this.userBookCollectionTable.name}.collectionId`);
        });

      if (ids && ids.length > 0) {
        query.whereIn(`${this.userBookTable.name}.id`, ids);
      }

      if (bookshelfId) {
        query.where(`${this.userBookTable.name}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query.where(`${this.collectionTable.name}.id`, collectionId);
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

  public async findUserBooksByUser(payload: FindUserBooksByUserPayload): Promise<UserBook[]> {
    const { userId, bookId, page, pageSize } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
        .select([
          `${this.bookTable.name}.id as bookId`,
          `${this.bookTable.name}.title as title`,
          `${this.bookTable.name}.isbn as isbn`,
          `${this.bookTable.name}.publisher as publisher`,
          `${this.bookTable.name}.releaseYear as releaseYear`,
          `${this.bookTable.name}.language as language`,
          `${this.bookTable.name}.translator as translator`,
          `${this.bookTable.name}.format as format`,
          `${this.bookTable.name}.pages as pages`,
          `${this.bookTable.name}.isApproved`,
          `${this.bookTable.name}.imageUrl as bookImageUrl`,
          `${this.userBookTable.name}.id`,
          `${this.userBookTable.name}.imageUrl`,
          `${this.userBookTable.name}.status`,
          `${this.userBookTable.name}.isFavorite`,
          `${this.userBookTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          `${this.authorTable.name}.name as authorName`,
          `${this.authorTable.name}.isApproved as isAuthorApproved`,
          `${this.genresTable.name}.id as genreId`,
          `${this.genresTable.name}.name as genreName`,
          `${this.collectionTable.name}.id as collectionId`,
          `${this.collectionTable.name}.name as collectionName`,
          `${this.collectionTable.name}.userId as userId`,
          `${this.bookReadingTable.name}.id as readingId`,
          `${this.bookReadingTable.name}.startedAt as readingStartedAt`,
          `${this.bookReadingTable.name}.endedAt as readingEndedAt`,
          `${this.bookReadingTable.name}.rating as readingRating`,
          `${this.bookReadingTable.name}.comment as readingComment`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.userBookGenresTable.name, (join) => {
          join.on(`${this.userBookGenresTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.userBookGenresTable.name}.genreId`);
        })
        .leftJoin(this.bookTable.name, (join) => {
          join.on(`${this.bookTable.name}.id`, `=`, `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.bookshelfTable.name, (join) => {
          join.on(`${this.bookshelfTable.name}.id`, `=`, `${this.userBookTable.name}.bookshelfId`);
        })
        .leftJoin(this.bookReadingTable.name, (join) => {
          join.on(`${this.bookReadingTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.userBookCollectionTable.name, (join) => {
          join.on(`${this.userBookCollectionTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
        })
        .leftJoin(this.collectionTable.name, (join) => {
          join.on(`${this.collectionTable.name}.id`, `=`, `${this.userBookCollectionTable.name}.collectionId`);
        });

      if (bookId) {
        query.where(`${this.userBookTable.name}.bookId`, bookId);
      }

      query.where(`${this.bookshelfTable.name}.userId`, userId);

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
      await this.databaseClient<UserBookRawEntity>(this.userBookTable.name).delete().whereIn('id', ids);
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'delete',
        error,
      });
    }
  }

  public async countUserBooks(payload: FindUserBooksPayload): Promise<number> {
    const { bookshelfId, ids, collectionId } = payload;

    try {
      const query = this.databaseClient<UserBookRawEntity>(this.userBookTable.name);

      if (ids && ids.length > 0) {
        query.whereIn(`${this.userBookTable.name}.id`, ids);
      }

      if (bookshelfId) {
        query.where(`${this.userBookTable.name}.bookshelfId`, bookshelfId);
      }

      if (collectionId) {
        query
          .join(this.userBookCollectionTable.name, (join) => {
            join.on(`${this.userBookCollectionTable.name}.userBookId`, '=', `${this.userBookTable.name}.id`);
          })
          .where(`${this.userBookCollectionTable.name}.collectionId`, collectionId);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count(*)'];

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
