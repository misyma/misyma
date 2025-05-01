import { TestUtils } from '../../../../../../tests/testUtils.js';
import { categoryTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type CategoryRawEntity } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { CategoryTestFactory } from '../../factories/categoryTestFactory/categoryTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<CategoryRawEntity>;
}

export class CategoryTestUtils extends TestUtils {
  private readonly categoryTestFactory = new CategoryTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, categoryTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<CategoryRawEntity> {
    const { input } = payload;

    const data = this.categoryTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<CategoryRawEntity>(categoryTable).insert(data, '*');

    const rawEntity = rawEntities[0] as CategoryRawEntity;

    return rawEntity;
  }

  public async findByName(name: string): Promise<CategoryRawEntity | null> {
    const category = await this.databaseClient<CategoryRawEntity>(categoryTable).where({ name }).first();

    return category || null;
  }

  public async findById(id: string): Promise<CategoryRawEntity | null> {
    const category = await this.databaseClient<CategoryRawEntity>(categoryTable).where({ id }).first();

    return category || null;
  }
}
