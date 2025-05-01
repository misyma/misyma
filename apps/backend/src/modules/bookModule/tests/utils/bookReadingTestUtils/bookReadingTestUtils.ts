import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookReadingRawEntity } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';
import { booksReadingsTable } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BookReadingTestFactory } from '../../factories/bookReadingTestFactory/bookReadingTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookReadingRawEntity> & { readonly user_book_id: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookReadingTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, booksReadingsTable);
  }

  private readonly bookReadingTestFactory = new BookReadingTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<BookReadingRawEntity> {
    const { input } = payload;

    const bookReading = this.bookReadingTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookReadingRawEntity>(booksReadingsTable).insert(
      {
        id: bookReading.getId(),
        user_book_id: bookReading.getUserBookId(),
        rating: bookReading.getRating(),
        comment: bookReading.getComment(),
        started_at: bookReading.getStartedAt(),
        ended_at: bookReading.getEndedAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookReadingRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookReadingRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookReadingRawEntity>(booksReadingsTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
