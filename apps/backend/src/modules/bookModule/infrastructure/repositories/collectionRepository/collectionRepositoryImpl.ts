import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type CollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/collectionsTable/collectionRawEntity.js';
import { collectionsTable } from '../../../../databaseModule/infrastructure/tables/collectionsTable/collectionsTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type CollectionState, Collection } from '../../../domain/entities/collection/collection.js';
import {
  type CollectionRepository,
  type FindCollectionPayload,
  type FindCollectionsPayload,
  type SaveCollectionPayload,
  type DeleteCollectionPayload,
  type CountCollectionsPayload,
} from '../../../domain/repositories/collectionRepository/collectionRepository.js';

import { type CollectionMapper } from './collectionMapper/collectionMapper.js';

type CreateCollectionPayload = { collection: CollectionState };

type UpdateCollectionPayload = { collection: Collection };

export class CollectionRepositoryImpl implements CollectionRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly collectionMapper: CollectionMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findCollection(payload: FindCollectionPayload): Promise<Collection | null> {
    let rawEntity: CollectionRawEntity | undefined;

    try {
      const query = this.databaseClient<CollectionRawEntity>(collectionsTable.name).select('*');

      if ('id' in payload) {
        query.where(collectionsTable.columns.id, payload.id);
      } else {
        query
          .where(collectionsTable.columns.name, payload.name)
          .andWhere(collectionsTable.columns.user_id, payload.userId);
      }

      rawEntity = await query.first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  public async findCollections(payload: FindCollectionsPayload): Promise<Collection[]> {
    const { ids, page, pageSize, sortDate, userId } = payload;

    let rawEntities: CollectionRawEntity[];

    const query = this.databaseClient<CollectionRawEntity>(collectionsTable.name)
      .select('*')
      .limit(pageSize)
      .offset(pageSize * (page - 1));

    if (ids) {
      query.whereIn(collectionsTable.columns.id, ids);
    }

    if (userId) {
      query.where(collectionsTable.columns.user_id, userId);
    }

    if (sortDate) {
      query.orderBy(collectionsTable.columns.id, sortDate);
    }

    try {
      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.collectionMapper.mapToDomain(rawEntity));
  }

  public async saveCollection(payload: SaveCollectionPayload): Promise<Collection> {
    const { collection } = payload;

    if (collection instanceof Collection) {
      return this.update({ collection });
    }

    return this.create({ collection });
  }

  private async create(payload: CreateCollectionPayload): Promise<Collection> {
    const {
      collection: { name, userId, createdAt },
    } = payload;

    let rawEntities: CollectionRawEntity[];

    try {
      rawEntities = await this.databaseClient<CollectionRawEntity>(collectionsTable.name)
        .insert({
          id: this.uuidService.generateUuid(),
          name,
          user_id: userId,
          created_at: createdAt,
        })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'create',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateCollectionPayload): Promise<Collection> {
    const { collection } = payload;

    let rawEntities: CollectionRawEntity[];

    try {
      const { name } = collection.getState();
      rawEntities = await this.databaseClient<CollectionRawEntity>(collectionsTable.name)
        .update({ name })
        .where({ id: collection.getId() })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'update',
        originalError: error,
      });
    }

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  public async deleteCollection(payload: DeleteCollectionPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<CollectionRawEntity>(collectionsTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countCollections(payload: CountCollectionsPayload): Promise<number> {
    const { ids, userId } = payload;

    try {
      const query = this.databaseClient<CollectionRawEntity>(collectionsTable.name);

      if (ids) {
        query.whereIn(collectionsTable.columns.id, ids);
      }

      if (userId) {
        query.where(collectionsTable.columns.user_id, userId);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Collection',
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
        entity: 'Collection',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
