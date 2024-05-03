import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookReadingRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReadingTable } from '../../../infrastructure/databases/bookDatabase/tables/bookReadingTable/bookReadingTable.js';
import { BookReadingTestFactory } from '../../factories/bookReadingTestFactory/bookReadingTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookReadingRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookReadingTestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly table = new BookReadingTable();

  private readonly bookReadingTestFactory = new BookReadingTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookReadingRawEntity> {
    const { input } = payload;

    const bookReading = this.bookReadingTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookReadingRawEntity>(this.table.name).insert(
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

    return {
      id: rawEntity.id,
      userBookId: rawEntity.userBookId,
      rating: rawEntity.rating,
      comment: rawEntity.comment,
      startedAt: new Date(rawEntity.startedAt),
      endedAt: rawEntity.endedAt ? new Date(rawEntity.endedAt) : undefined,
    };
  }

  public async findById(payload: FindByIdPayload): Promise<BookReadingRawEntity | null> {
    const { id } = payload;

    const result = await this.databaseClient<BookReadingRawEntity>(this.table.name).where({ id }).first();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      userBookId: result.userBookId,
      rating: result.rating,
      comment: result.comment,
      startedAt: new Date(result.startedAt),
      endedAt: result.endedAt ? new Date(result.endedAt) : undefined,
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient(this.table.name).truncate();
  }
}
