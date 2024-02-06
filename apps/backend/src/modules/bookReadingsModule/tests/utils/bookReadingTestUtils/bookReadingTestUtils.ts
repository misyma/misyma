import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
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

    const rawEntities = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).insert(
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

    const rawEntity = rawEntities[0] as BookReadingRawEntity;

    return {
      id: rawEntity.id,
      bookId: rawEntity.bookId,
      rating: rawEntity.rating,
      comment: rawEntity.comment,
      startedAt: new Date(rawEntity.startedAt),
      endedAt: rawEntity.endedAt ? new Date(rawEntity.endedAt) : undefined,
    };
  }

  public async findById(payload: FindByIdPayload): Promise<BookReadingRawEntity | null> {
    const { id } = payload;

    const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name)
      .where(this.table.columns.id, id)
      .first();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      bookId: result.bookId,
      rating: result.rating,
      comment: result.comment,
      startedAt: new Date(result.startedAt),
      endedAt: result.endedAt ? new Date(result.endedAt) : undefined,
    };
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient(this.table.name).truncate();
  }
}
