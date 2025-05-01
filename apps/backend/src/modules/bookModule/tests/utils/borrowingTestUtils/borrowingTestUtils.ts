import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BorrowingRawEntity } from '../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingRawEntity.js';
import { borrowingsTable } from '../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BorrowingTestFactory } from '../../factories/borrowingTestFactory/borrowingTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BorrowingRawEntity> & { readonly user_book_id: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class BorrowingTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, borrowingsTable);
  }

  private readonly borrowingTestFactory = new BorrowingTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<BorrowingRawEntity> {
    const { input } = payload;

    const borrowing = this.borrowingTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<BorrowingRawEntity>(borrowingsTable).insert(borrowing, '*');

    const rawEntity = rawEntities[0] as BorrowingRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BorrowingRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BorrowingRawEntity>(borrowingsTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
