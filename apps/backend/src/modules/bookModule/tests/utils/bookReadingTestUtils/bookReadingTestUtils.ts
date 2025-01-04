import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookReadingRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookReadingTable/bookReadingRawEntity.js';
import { bookReadingTable } from '../../../infrastructure/databases/bookDatabase/tables/bookReadingTable/bookReadingTable.js';
import { BookReadingTestFactory } from '../../factories/bookReadingTestFactory/bookReadingTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookReadingRawEntity> & { readonly userBookId: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookReadingTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, bookReadingTable);
  }

  private readonly bookReadingTestFactory = new BookReadingTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<BookReadingRawEntity> {
    const { input } = payload;

    const bookReading = this.bookReadingTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookReadingRawEntity>(bookReadingTable).insert(
      {
        id: bookReading.getId(),
        userBookId: bookReading.getUserBookId(),
        rating: bookReading.getRating(),
        comment: bookReading.getComment(),
        startedAt: bookReading.getStartedAt(),
        endedAt: bookReading.getEndedAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookReadingRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookReadingRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookReadingRawEntity>(bookReadingTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
