import { TestUtils } from '../../../../../../tests/testUtils.js';
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

export class BorrowingTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, borrowingTable);
  }

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

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BorrowingRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BorrowingRawEntity>(borrowingTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
