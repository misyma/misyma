import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookAuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/booksAuthorsTable/bookAuthorRawEntity.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/booksAuthorsTable/booksAuthorsTable.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/booksTable/bookRawEntity.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/booksTable/booksTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type Transaction } from '../../../../databaseModule/types/transaction.js';
import { BookTestFactory } from '../../factories/bookTestFactory/bookTestFactory.js';

export interface CreateAndPersistBookPayload {
  readonly input?: {
    readonly book?: Partial<BookRawEntity> & { readonly categoryId?: string | undefined };
    readonly authorIds?: string[] | undefined;
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

export class BookTestUtils extends TestUtils {
  private readonly bookTestFactory = new BookTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, booksTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistBookPayload = {}): Promise<BookRawEntity> {
    const { input } = payload;

    const book = this.bookTestFactory.createRaw(input?.book);

    let rawEntities: BookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<BookRawEntity>(booksTable.name).insert(book, '*');

      if (input?.authorIds) {
        await transaction.batchInsert<BookAuthorRawEntity>(
          booksAuthorsTable.name,
          input.authorIds.map((authorId) => ({
            book_id: book.id,
            author_id: authorId,
          })),
        );
      }
    });

    const bookRawEntity = rawEntities[0] as BookRawEntity;

    return bookRawEntity;
  }

  public async findBookAuthors(payload: FindBookAuthorsPayload): Promise<BookAuthorRawEntity[]> {
    const { bookId } = payload;

    const rawEntities = await this.databaseClient<BookAuthorRawEntity>(booksAuthorsTable.name).select('*').where({
      book_id: bookId,
    });

    return rawEntities;
  }

  public async findById(payload: FindByIdPayload): Promise<BookRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookRawEntity>(booksTable.name).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findByTitleAndAuthor(payload: FindByTitleAndAuthorPayload): Promise<BookRawEntity | undefined> {
    const { title, authorId } = payload;

    const rawEntity = await this.databaseClient<BookRawEntity>(booksTable.name)
      .select([booksTable.allColumns])
      .join(booksAuthorsTable.name, (join) => {
        if (authorId) {
          join.onIn(booksAuthorsTable.columns.author_id, this.databaseClient.raw('?', [authorId]));
        }
      })
      .where({ title })
      .first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity as BookRawEntity;
  }
}
