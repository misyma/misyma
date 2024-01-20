import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type BooksAuthorsRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
import { BooksAuthorsTable } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookTable.js';
import { BookRawEntityTestFactory } from '../../factories/bookRawEntityTestFactory/bookRawEntityTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<BookRawEntity> & {
    authorIds: string[];
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

export class BookTestUtils {
  private readonly databaseTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly bookTestFactory = new BookRawEntityTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<BookRawEntity> {
    return this.sqliteDatabaseClient<BookRawEntity>(this.databaseTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BookRawEntity> {
    const { input } = payload;

    const book = this.bookTestFactory.create(input);

    let rawEntities: BookRawEntity[] = [];

    await this.sqliteDatabaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction(this.databaseTable.name).insert(book);

      if (input?.authorIds) {
        await transaction.batchInsert(
          this.booksAuthorsTable.name,
          input.authorIds.map((authorId) => ({
            [this.booksAuthorsTable.columns.bookId]: book.id,
            [this.booksAuthorsTable.columns.authorId]: authorId,
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

    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.insert(book);
  }

  public async findById(payload: FindByIdPayload): Promise<BookRawEntity> {
    const { id } = payload;

    const queryBuilder = this.createQueryBuilder();

    const bookRawEntity = await queryBuilder.select('*').where({ id }).first();

    return bookRawEntity as BookRawEntity;
  }

  public async findByTitleAndAuthor(payload: FindByTitleAndAuthorPayload): Promise<BookRawEntity> {
    const { title, authorId } = payload;

    const queryBuilder = this.createQueryBuilder();

    const bookRawEntity = await queryBuilder
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

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
