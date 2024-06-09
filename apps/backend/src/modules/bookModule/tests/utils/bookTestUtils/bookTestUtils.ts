import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type BookAuthorRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookAuthorTable/bookAuthorRawEntity.js';
import { BooksAuthorsTable } from '../../../infrastructure/databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { BookTable } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookTable.js';
import { BookTestFactory } from '../../factories/bookTestFactory/bookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: {
    book?: Partial<BookRawEntity>;
    authorIds?: string[];
  };
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
        await transaction.batchInsert<BookAuthorRawEntity>(
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

  public async findBookAuthors(payload: FindBookAuthorsPayload): Promise<BookAuthorRawEntity[]> {
    const { bookId } = payload;

    const rawEntities = await this.databaseClient(this.booksAuthorsTable.name).select('*').where({
      bookId,
    });

    return rawEntities;
  }

  public async findById(payload: FindByIdPayload): Promise<BookRawEntity | undefined> {
    const { id } = payload;

    const bookRawEntity = await this.databaseClient<BookRawEntity>(this.bookTable.name)
      .select('*')
      .where({ id })
      .first();

    if (!bookRawEntity) {
      return undefined;
    }

    return {
      ...bookRawEntity,
      isApproved: Boolean(bookRawEntity.isApproved),
    };
  }

  public async findByTitleAndAuthor(payload: FindByTitleAndAuthorPayload): Promise<BookRawEntity | undefined> {
    const { title, authorId } = payload;

    const bookRawEntity = await this.databaseClient<BookRawEntity>(this.bookTable.name)
      .select([
        `${this.bookTable.name}.id`,
        `${this.bookTable.name}.title`,
        `${this.bookTable.name}.isbn`,
        `${this.bookTable.name}.publisher`,
        `${this.bookTable.name}.releaseYear`,
        `${this.bookTable.name}.language`,
        `${this.bookTable.name}.translator`,
        `${this.bookTable.name}.format`,
        `${this.bookTable.name}.pages`,
        `${this.bookTable.name}.isApproved`,
        `${this.bookTable.name}.imageUrl`,
      ])
      .join(this.booksAuthorsTable.name, (join) => {
        if (authorId) {
          join.onIn(`${this.booksAuthorsTable.name}.authorId`, this.databaseClient.raw('?', [authorId]));
        }
      })
      .where({ title })
      .first();

    if (!bookRawEntity) {
      return undefined;
    }

    return {
      ...bookRawEntity,
      isApproved: Boolean(bookRawEntity.isApproved),
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<BookRawEntity>(this.bookTable.name).truncate();
  }
}
