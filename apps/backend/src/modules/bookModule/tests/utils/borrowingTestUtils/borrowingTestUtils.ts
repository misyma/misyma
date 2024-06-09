import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BorrowingRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/borrowingTable/borrowingRawEntity.js';
import { borrowingTable } from '../../../infrastructure/databases/bookDatabase/tables/borrowingTable/borrowingTable.js';
import { BorrowingTestFactory } from '../../factories/borrowingTestFactory/borrowingTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BorrowingRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class BorrowingTestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly borrowingTestFactory = new BorrowingTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BorrowingRawEntity> {
    const { input } = payload;

    const borrowing = this.borrowingTestFactory.create(input);

    const rawEntities = await this.databaseClient<BorrowingRawEntity>(borrowingTable).insert(
      {
        id: borrowing.getId(),
        userBookId: borrowing.getUserBookId(),
        borrower: borrowing.getBorrower(),
        startedAt: borrowing.getStartedAt(),
        endedAt: borrowing.getEndedAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BorrowingRawEntity;

    return {
      id: rawEntity.id,
      userBookId: rawEntity.userBookId,
      borrower: rawEntity.borrower,
      startedAt: new Date(rawEntity.startedAt),
      endedAt: rawEntity.endedAt ? new Date(rawEntity.endedAt) : undefined,
    };
  }

  public async findById(payload: FindByIdPayload): Promise<BorrowingRawEntity | null> {
    const { id } = payload;

    const result = await this.databaseClient<BorrowingRawEntity>(borrowingTable).where({ id }).first();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      userBookId: result.userBookId,
      borrower: result.borrower,
      startedAt: new Date(result.startedAt),
      endedAt: result.endedAt ? new Date(result.endedAt) : undefined,
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient(borrowingTable).truncate();
  }
}
