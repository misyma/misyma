import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';
import { type Category } from '../../entities/category/category.js';

export interface CreateCategoriesPayload {
  readonly names: string[];
}

export class CategoryRepository {
  private readonly categoriesTable = 'categories';

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
  ) {}

  public async createCategories(payload: CreateCategoriesPayload): Promise<void> {
    const { names } = payload;

    const categories = names.map((name) => ({
      id: this.uuidService.generateUuid(),
      name,
    }));

    try {
      await this.databaseClient(this.categoriesTable).insert(categories).onConflict('name').ignore();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'create',
        originalError: error,
      });
    }
  }

  public async findCategories(): Promise<Category[]> {
    try {
      const categories = await this.databaseClient<Category>(this.categoriesTable).select('*');

      return categories;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'findMany',
        originalError: error,
      });
    }
  }
}
