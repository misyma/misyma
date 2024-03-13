import { type UserBookMapper } from './userBookMapper/userBookMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { AuthorTable } from '../../../../authorModule/infrastructure/databases/tables/authorTable/authorTable.js';
import { UserBook, type UserBookState } from '../../../domain/entities/userBook/userBook.js';
import {
  type DeleteUserBookPayload,
  type FindUserBookPayload,
  type FindUserBooksPayload,
  type SaveUserBookPayload,
  type UserBookRepository,
} from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { BookGenresTable } from '../../databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { BooksAuthorsTable } from '../../databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { BookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';
import { type UserBookRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { UserBookTable } from '../../databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { type UserBookWithJoinsRawEntity } from '../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

type CreateUserBookPayload = { userBook: UserBookState };

type UpdateUserBookPayload = { userBook: UserBook };

export class UserBookRepositoryImpl implements UserBookRepository {
  private readonly userBookTable = new UserBookTable();
  private readonly bookTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly authorTable = new AuthorTable();
  private readonly bookGenresTable = new BookGenresTable();
  private readonly genresTable = new GenreTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
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
      userBook: { imageUrl, status, bookshelfId, bookId },
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name).insert({
        id,
        imageUrl,
        status,
        bookshelfId,
        bookId,
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

    const { bookshelfId, status, imageUrl } = userBook.getState();

    let updateData: Partial<UserBookRawEntity> = {
      bookshelfId,
      status,
    };

    if (imageUrl) {
      updateData = {
        ...updateData,
        imageUrl,
      };
    }

    try {
      await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name)
        .update(updateData)
        .where({ id: userBook.getId() })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'update',
        error,
      });
    }

    return (await this.findUserBook({ id: userBook.getId() })) as UserBook;
  }

  public async findUserBook(payload: FindUserBookPayload): Promise<UserBook | null> {
    const { id, authorIds, title, bookshelfId } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name)
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
          `${this.userBookTable.name}.id as userBookId`,
          `${this.userBookTable.name}.imageUrl`,
          `${this.userBookTable.name}.status`,
          `${this.userBookTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          'firstName',
          'lastName',
          `${this.genresTable.name}.id as genreId`,
          `${this.genresTable.name}.name as genreName`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);

          if (authorIds) {
            join.andOnIn(
              `${this.booksAuthorsTable.name}.authorId`,
              this.sqliteDatabaseClient.raw('?', [authorIds.join(',')]),
            );
          }
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.bookGenresTable.name, (join) => {
          join.on(`${this.bookGenresTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.bookGenresTable.name}.genreId`);
        })
        .leftJoin(this.bookTable.name, (join) => {
          join.on(`${this.bookTable.name}.id`, `=`, `${this.userBookTable.name}.bookId`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${this.userBookTable.name}.userBookId`, id);
          }

          if (title) {
            builder.where(`${this.bookTable.name}.title`, title);
          }

          if (bookshelfId) {
            builder.where(`"${this.userBookTable.name}.bookshelfId"`, bookshelfId);
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
    const { bookshelfId, ids } = payload;

    let rawEntities: UserBookWithJoinsRawEntity[];

    try {
      const query = this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name)
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
          `${this.userBookTable.name}.id as userBookId`,
          `${this.userBookTable.name}.imageUrl`,
          `${this.userBookTable.name}.status`,
          `${this.userBookTable.name}.bookshelfId`,
          `${this.authorTable.name}.id as authorId`,
          'firstName',
          'lastName',
          `${this.genresTable.name}.id as genreId`,
          `${this.genresTable.name}.name as genreName`,
        ])
        .leftJoin(this.booksAuthorsTable.name, (join) => {
          join.on(`${this.booksAuthorsTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.authorTable.name, (join) => {
          join.on(`${this.authorTable.name}.id`, '=', `${this.booksAuthorsTable.name}.authorId`);
        })
        .leftJoin(this.bookGenresTable.name, (join) => {
          join.on(`${this.bookGenresTable.name}.bookId`, '=', `${this.userBookTable.name}.bookId`);
        })
        .leftJoin(this.genresTable.name, (join) => {
          join.on(`${this.genresTable.name}.id`, `=`, `${this.bookGenresTable.name}.genreId`);
        })
        .leftJoin(this.bookTable.name, (join) => {
          join.on(`${this.bookTable.name}.id`, `=`, `${this.userBookTable.name}.bookId`);
        });

      if (ids.length > 0) {
        query.whereIn(`${this.userBookTable.name}.userBookId`, ids);
      }

      if (bookshelfId) {
        query.where(`${this.userBookTable.name}.bookshelfId`, bookshelfId);
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

  public async deleteUserBook(payload: DeleteUserBookPayload): Promise<void> {
    const { id } = payload;

    const existingUserBook = await this.findUserBook({ id });

    if (!existingUserBook) {
      throw new ResourceNotFoundError({
        name: 'UserBook',
        id,
      });
    }

    try {
      await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name).delete().where({
        id: existingUserBook.getId(),
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'UserBook',
        operation: 'delete',
        error,
      });
    }
  }
}
