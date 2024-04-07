import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type BooksAuthorsRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsRawEntity.js';
import { BooksAuthorsTable } from '../../../infrastructure/databases/bookDatabase/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookTable.js';
import { BookTestFactory } from '../../factories/bookTestFactory/bookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: {
    book?: Partial<BookRawEntity>;
    authorIds?: string[];
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

export class BookTestUtils {
  private readonly bookTable = new BookTable();
  private readonly booksAuthorsTable = new BooksAuthorsTable();
  private readonly bookTestFactory = new BookTestFactory();

  public constructor(private readonly databaseClient: DatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BookRawEntity> {
    const { input } = payload;

    const book = this.bookTestFactory.createRaw(input?.book);

    let rawEntities: BookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
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
    });

    return rawEntities[0] as BookRawEntity;
  }

  public async findBookAuthors(payload: FindBookAuthorsPayload): Promise<BooksAuthorsRawEntity[]> {
    const { bookId } = payload;

    const rawEntities = await this.databaseClient(this.booksAuthorsTable.name).select('*').where({
      bookId,
    });

    return rawEntities;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { book } = payload;

    await this.databaseClient<BookRawEntity>(this.bookTable.name).insert(book);
  }

  public async findById(payload: FindByIdPayload): Promise<BookRawEntity> {
    const { id } = payload;

    const bookRawEntity = await this.databaseClient<BookRawEntity>(this.bookTable.name)
      .select('*')
      .where({ id })
      .first();

    return bookRawEntity as BookRawEntity;
  }

  public async findByTitleAndAuthor(payload: FindByTitleAndAuthorPayload): Promise<BookRawEntity> {
    const { title, authorId } = payload;

    const bookRawEntity = await this.databaseClient<BookRawEntity>(this.bookTable.name)
      .select('*')
      .join(this.booksAuthorsTable.name, (join) => {
        if (authorId) {
          join.onIn(`${this.booksAuthorsTable.name}.authorId`, this.databaseClient.raw('?', [authorId]));
        }
      })
      .where({
        title,
      })
      .first();

    return bookRawEntity as BookRawEntity;
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<BookRawEntity>(this.bookTable.name).truncate();
  }
}
