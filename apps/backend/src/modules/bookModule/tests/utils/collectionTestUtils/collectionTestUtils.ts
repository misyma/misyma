import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type CollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/collectionsTable/collectionRawEntity.js';
import { collectionsTable } from '../../../../databaseModule/infrastructure/tables/collectionsTable/collectionsTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { CollectionTestFactory } from '../../factories/collectionTestFactory/collectionTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<CollectionRawEntity> & { readonly user_id: string };
}

export class CollectionTestUtils extends TestUtils {
  private readonly collectionTestFactory = new CollectionTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, collectionsTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<CollectionRawEntity> {
    const { input } = payload;

    const data = this.collectionTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<CollectionRawEntity>(collectionsTable.name).insert(data, '*');

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return rawEntity;
  }

  public async findByName(name: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionsTable.name).where({ name }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }

  public async findById(id: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionsTable.name).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
