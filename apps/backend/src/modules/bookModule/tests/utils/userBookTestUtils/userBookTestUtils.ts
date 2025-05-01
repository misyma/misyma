import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type UserBookCollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { usersBooksCollectionsTable } from '../../../../databaseModule/infrastructure/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookRawEntity.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type Transaction } from '../../../../databaseModule/types/transaction.js';
import { UserBookTestFactory } from '../../factories/userBookTestFactory/userBookTestFactory.js';

export interface CreateAndPersistUserBookPayload {
  readonly input?: Partial<UserBookRawEntity> & Pick<UserBookRawEntity, 'book_id' | 'bookshelf_id'>;
  readonly collectionIds?: string[];
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByIdsPayload {
  readonly ids: string[];
}

export class UserBookTestUtils extends TestUtils {
  private readonly userBookTestFactory = new UserBookTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, usersBooksTable);
  }

  public async createAndPersist(payload: CreateAndPersistUserBookPayload = {}): Promise<UserBookRawEntity> {
    const { input, collectionIds } = payload;

    const userBook = this.userBookTestFactory.createRaw(input);

    let rawEntities: UserBookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<UserBookRawEntity>(usersBooksTable).insert(userBook, '*');

      if (collectionIds) {
        await transaction.batchInsert<UserBookCollectionRawEntity>(
          usersBooksCollectionsTable,
          collectionIds.map((collectionId) => ({
            collection_id: collectionId,
            user_book_id: userBook.id,
          })),
        );
      }
    });

    const rawEntity = rawEntities[0] as UserBookRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserBookRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<UserBookRawEntity>(usersBooksTable).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findByIds(payload: FindByIdsPayload): Promise<UserBookRawEntity[]> {
    const { ids } = payload;

    const rawEntities = await this.databaseClient<UserBookRawEntity>(usersBooksTable).select('*').whereIn('id', ids);

    return rawEntities;
  }
}
