import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { categoriesTable } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type CategoryRawEntity } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { Category, type CategoryState } from '../../../domain/entities/category/category.js';
import {
  type FindCategoryPayload,
  type CategoryRepository,
  type FindCategories,
  type SaveCategoryPayload,
  type DeleteCategoryPayload,
} from '../../../domain/repositories/categoryRepository/categoryRepository.js';

import { type CategoryMapper } from './categoryMapper/categoryMapper.js';

type CreateCategoryPayload = { category: CategoryState };

type UpdateCategoryPayload = { category: Category };

export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly categoryMapper: CategoryMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findCategory(payload: FindCategoryPayload): Promise<Category | null> {
    const { id, name } = payload;

    let rawEntity: CategoryRawEntity | undefined;

    let whereCondition: Partial<CategoryRawEntity> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (name) {
      whereCondition = {
        ...whereCondition,
        name,
      };
    }

    try {
      rawEntity = await this.databaseClient<CategoryRawEntity>(categoriesTable)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.categoryMapper.mapToDomain(rawEntity);
  }

  public async findCategories(payload: FindCategories): Promise<Category[]> {
    const { ids, page, pageSize } = payload;

    let rawEntities: CategoryRawEntity[];

    const query = this.databaseClient<CategoryRawEntity>(categoriesTable)
      .select('*')
      .limit(pageSize)
      .offset(pageSize * (page - 1));

    if (ids) {
      query.whereIn('id', ids);
    }

    try {
      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.categoryMapper.mapToDomain(rawEntity));
  }

  public async saveCategory(payload: SaveCategoryPayload): Promise<Category> {
    const { category } = payload;

    if (category instanceof Category) {
      return this.update({ category });
    }

    return this.create({ category });
  }

  private async create(payload: CreateCategoryPayload): Promise<Category> {
    const {
      category: { name },
    } = payload;

    let rawEntities: CategoryRawEntity[];

    try {
      rawEntities = await this.databaseClient<CategoryRawEntity>(categoriesTable)
        .insert({
          id: this.uuidService.generateUuid(),
          name,
        })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'create',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as CategoryRawEntity;

    return this.categoryMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateCategoryPayload): Promise<Category> {
    const { category } = payload;

    let rawEntities: CategoryRawEntity[];

    try {
      rawEntities = await this.databaseClient<CategoryRawEntity>(categoriesTable)
        .update(category.getState())
        .where({ id: category.getId() })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'update',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as CategoryRawEntity;

    return this.categoryMapper.mapToDomain(rawEntity);
  }

  public async deleteCategory(payload: DeleteCategoryPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<CategoryRawEntity>(categoriesTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countCategories(payload: FindCategories): Promise<number> {
    const { ids } = payload;

    try {
      const query = this.databaseClient<CategoryRawEntity>(categoriesTable);

      if (ids) {
        query.whereIn('id', ids);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Category',
          operation: 'count',
          countResult,
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Category',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
