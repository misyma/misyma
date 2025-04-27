import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type CollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/collectionTable/collectionRawEntity.js';
import { collectionTable } from '../../../../databaseModule/infrastructure/tables/collectionTable/collectionTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { CollectionTestFactory } from '../../factories/collectionTestFactory/collectionTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<CollectionRawEntity>;
}

export class CollectionTestUtils extends TestUtils {
  private readonly collectionTestFactory = new CollectionTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, collectionTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<CollectionRawEntity> {
    const { input } = payload;

    const data = this.collectionTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<CollectionRawEntity>(collectionTable).insert(data, '*');

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return rawEntity;
  }

  public async findByName(name: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionTable).where({ name }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }

  public async findById(id: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
