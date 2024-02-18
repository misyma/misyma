import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type BookGenresRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookGenresTable/bookGenresRawEntity.js';
import { BookGenresTable } from '../../../infrastructure/databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { type BooksAuthorsRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
import { BooksAuthorsTable } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookTable.js';
import { BookRawEntityTestFactory } from '../../factories/bookRawEntityTestFactory/bookRawEntityTestFactory.js';

interface CreateAndPersistPayload {
  input?: {
    book?: Partial<BookRawEntity>;
    authorIds?: string[];
    genreIds?: string[];
  };
}

interface PersistPayload {
  book: BookRawEntity;
}

interface FindByIdPayload {
  id: string;
}

interface FindRawBookAuthorsByIdPayload {
  id: string;
}

interface FindByTitleAndAuthorPayload {
  title: string;
  authorId: string;
}

interface FindBookGenresPayload {
  bookId: string;
}

export class BookTestUtils {
  private readonly bookTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly bookGenresTable = new BookGenresTable();
  private readonly bookTestFactory = new BookRawEntityTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BookRawEntity> {
    const { input } = payload;

    const book = this.bookTestFactory.create(input?.book);

    let rawEntities: BookRawEntity[] = [];

    await this.sqliteDatabaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<BookRawEntity>(this.bookTable.name).insert(book, '*');

      if (input?.authorIds) {
        await transaction.batchInsert(
          this.booksAuthorsTable.name,
          input.authorIds.map((authorId) => ({
            [this.booksAuthorsTable.columns.bookId]: book.id,
            [this.booksAuthorsTable.columns.authorId]: authorId,
          })),
        );
      }

      if (input?.genreIds) {
        await transaction.batchInsert(
          this.bookGenresTable.name,
          input.genreIds.map((genreId) => ({
            [this.bookGenresTable.columns.genreId]: genreId,
            [this.bookGenresTable.columns.bookId]: book.id,
          })),
        );
      }
    });

    return rawEntities[0] as BookRawEntity;
  }

  public async findRawBookAuthorsById(payload: FindRawBookAuthorsByIdPayload): Promise<BooksAuthorsRawEntity[]> {
    const { id } = payload;

    const rawEntities = await this.sqliteDatabaseClient(this.booksAuthorsTable.name)
      .select('*')
      .where({
        [this.booksAuthorsTable.columns.bookId]: id,
      });

    return rawEntities;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { book } = payload;

    await this.sqliteDatabaseClient<BookRawEntity>(this.bookTable.name).insert(book);
  }

  public async findById(payload: FindByIdPayload): Promise<BookRawEntity> {
    const { id } = payload;

    const bookRawEntity = await this.sqliteDatabaseClient<BookRawEntity>(this.bookTable.name)
      .select('*')
      .where({ id })
      .first();

    return bookRawEntity as BookRawEntity;
  }

  public async findByTitleAndAuthor(payload: FindByTitleAndAuthorPayload): Promise<BookRawEntity> {
    const { title, authorId } = payload;

    const bookRawEntity = await this.sqliteDatabaseClient<BookRawEntity>(this.bookTable.name)
      .select('*')
      .join(this.booksAuthorsTable.name, (join) => {
        if (authorId) {
          join.onIn(
            `${this.booksAuthorsTable.name}.${this.booksAuthorsTable.columns.authorId}`,
            this.sqliteDatabaseClient.raw('?', [authorId]),
          );
        }
      })
      .where({
        title,
      })
      .first();

    return bookRawEntity as BookRawEntity;
  }

  public async findRawBookGenres(payload: FindBookGenresPayload): Promise<BookGenresRawEntity[]> {
    const { bookId } = payload;

    const rawEntities = await this.sqliteDatabaseClient<BookGenresRawEntity>(this.bookGenresTable.name)
      .select('*')
      .where({
        [this.bookGenresTable.columns.bookId]: bookId,
      });

    return rawEntities;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<BookRawEntity>(this.bookTable.name).truncate();
  }
}
