import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type CollectionRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';
import { collectionTable } from '../../../infrastructure/databases/bookDatabase/tables/collectionTable/collectionTable.js';
import { CollectionTestFactory } from '../../factories/collectionTestFactory/collectionTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<CollectionRawEntity>;
}

export class CollectionTestUtils implements TestUtils {
  private readonly collectionTestFactory = new CollectionTestFactory();

  public constructor(private readonly databaseClient: DatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<CollectionRawEntity> {
    const { input } = payload;

    const data = this.collectionTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<CollectionRawEntity>(collectionTable).insert(data, '*');

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return {
      id: rawEntity.id,
      name: rawEntity.name,
      userId: rawEntity.userId,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async findByName(name: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionTable).where({ name }).first();

    if (!rawEntity) {
      return null;
    }

    return {
      id: rawEntity.id,
      name: rawEntity.name,
      userId: rawEntity.userId,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async findById(id: string): Promise<CollectionRawEntity | null> {
    const rawEntity = await this.databaseClient<CollectionRawEntity>(collectionTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return {
      id: rawEntity.id,
      name: rawEntity.name,
      userId: rawEntity.userId,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<CollectionRawEntity>(collectionTable).truncate();
  }
}
