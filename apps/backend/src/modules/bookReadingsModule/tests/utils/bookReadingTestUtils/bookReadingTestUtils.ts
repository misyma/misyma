import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type BookReadingRawEntity } from '../../../infrastructure/databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReadingTable } from '../../../infrastructure/databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingTable.js';
import { BookReadingTestFactory } from '../../factories/bookReadingTestFactory/bookReadingTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<BookReadingRawEntity>;
}

interface FindByIdPayload {
  id: string;
}

export class BookReadingTestUtils {
  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private readonly table = new BookReadingTable();

  private readonly bookReadingTestFactory = BookReadingTestFactory.createFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookReadingRawEntity> {
    const { input } = payload;

    const bookReading = this.bookReadingTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
      {
        id: bookReading.getId(),
        bookId: bookReading.getBookId(),
        rating: bookReading.getRating(),
        comment: bookReading.getComment(),
        startedAt: bookReading.getStartedAt(),
        endedAt: bookReading.getEndedAt(),
      },
      '*',
    );

    return rawEntities[0] as BookReadingRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookReadingRawEntity | null> {
    const { id } = payload;

    const result = await this.createQueryBuilder().where(this.table.columns.id, id).first();

    if (!result) {
      return null;
    }

    return result;
  }

  private createQueryBuilder(): QueryBuilder<BookReadingRawEntity> {
    return this.sqliteDatabaseClient(this.table.name);
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
