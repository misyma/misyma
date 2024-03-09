import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type BookGenresRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookGenresTable/bookGenresRawEntity.js';
import { BookGenresTable } from '../../../infrastructure/databases/bookDatabase/tables/bookGenresTable/bookGenresTable.js';
import { type BooksAuthorsRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
import { BooksAuthorsTable } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookTable.js';
import { BookTestFactory } from '../../factories/bookTestFactory/bookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: {
    book?: Partial<BookRawEntity>;
    authorIds?: string[];
    genreIds?: string[];
  };
}

interface PersistPayload {
  readonly book: BookRawEntity;
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindBookAuthorsPayload {
  readonly bookId: string;
}

interface FindByTitleAndAuthorPayload {
  readonly title: string;
  readonly authorId: string;
}

interface FindBookGenresPayload {
  readonly bookId: string;
}

export class BookTestUtils {
  private readonly bookTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly bookGenresTable = new BookGenresTable();
  private readonly bookTestFactory = new BookTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BookRawEntity> {
    const { input } = payload;

    const book = this.bookTestFactory.createRaw(input?.book);

    let rawEntities: BookRawEntity[] = [];

    await this.sqliteDatabaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<BookRawEntity>(this.bookTable.name).insert(book, '*');

      if (input?.authorIds) {
        await transaction.batchInsert<BooksAuthorsRawEntity>(
          this.booksAuthorsTable.name,
          input.authorIds.map((authorId) => ({
            bookId: book.id,
            authorId,
          })),
        );
      }

      if (input?.genreIds) {
        await transaction.batchInsert<BookGenresRawEntity>(
          this.bookGenresTable.name,
          input.genreIds.map((genreId) => ({
            genreId,
            bookId: book.id,
          })),
        );
      }
    });

    return rawEntities[0] as BookRawEntity;
  }

  public async findBookAuthors(payload: FindBookAuthorsPayload): Promise<BooksAuthorsRawEntity[]> {
    const { bookId } = payload;

    const rawEntities = await this.sqliteDatabaseClient(this.booksAuthorsTable.name).select('*').where({
      bookId,
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
          join.onIn(`${this.booksAuthorsTable.name}.authorId`, this.sqliteDatabaseClient.raw('?', [authorId]));
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
      .where({ bookId });

    return rawEntities;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<BookRawEntity>(this.bookTable.name).truncate();
  }
}
