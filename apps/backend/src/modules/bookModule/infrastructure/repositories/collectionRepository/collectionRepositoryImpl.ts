import { type CollectionMapper } from './collectionMapper/collectionMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type CollectionState, Collection } from '../../../domain/entities/collection/collection.js';
import {
  type CollectionRepository,
  type FindCollectionPayload,
  type FindCollections,
  type SaveCollectionPayload,
  type DeleteCollectionPayload,
} from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type CollectionRawEntity } from '../../databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';
import { CollectionTable } from '../../databases/bookDatabase/tables/collectionTable/collectionTable.js';

type CreateCollectionPayload = { collection: CollectionState };

type UpdateCollectionPayload = { collection: Collection };

export class CollectionRepositoryImpl implements CollectionRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly collectionMapper: CollectionMapper,
    private readonly uuidService: UuidService,
  ) {}

  private readonly collectionTable = new CollectionTable();

  public async findCollection(payload: FindCollectionPayload): Promise<Collection | null> {
    let rawEntity: CollectionRawEntity | undefined;

    let whereCondition: Partial<CollectionRawEntity> = {};

    if ('id' in payload) {
      whereCondition = {
        ...whereCondition,
        id: payload.id,
      };
    }

    if ('name' in payload && 'userId' in payload) {
      whereCondition = {
        ...whereCondition,
        name: payload.name,
        userId: payload.userId,
      };
    }

    try {
      rawEntity = await this.databaseClient<CollectionRawEntity>(this.collectionTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  public async findCollections(payload: FindCollections): Promise<Collection[]> {
    const { ids, page, pageSize } = payload;

    let rawEntities: CollectionRawEntity[];

    const query = this.databaseClient<CollectionRawEntity>(this.collectionTable.name)
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
        entity: 'Collection',
        operation: 'find',
        error,
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
      collection: { name, userId },
    } = payload;

    let rawEntities: CollectionRawEntity[];

    try {
      rawEntities = await this.databaseClient<CollectionRawEntity>(this.collectionTable.name)
        .insert({
          id: this.uuidService.generateUuid(),
          name,
          userId,
        })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'create',
        error,
      });
    }

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateCollectionPayload): Promise<Collection> {
    const { collection } = payload;

    let rawEntities: CollectionRawEntity[];

    try {
      rawEntities = await this.databaseClient<CollectionRawEntity>(this.collectionTable.name)
        .update(collection.getState())
        .where({ id: collection.getId() })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'update',
        error,
      });
    }

    const rawEntity = rawEntities[0] as CollectionRawEntity;

    return this.collectionMapper.mapToDomain(rawEntity);
  }

  public async deleteCollection(payload: DeleteCollectionPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<CollectionRawEntity>(this.collectionTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Collection',
        operation: 'delete',
        error,
      });
    }
  }

  public async countCollections(payload: FindCollections): Promise<number> {
    const { ids } = payload;

    try {
      const query = this.databaseClient<CollectionRawEntity>(this.collectionTable.name);

      if (ids) {
        query.whereIn('id', ids);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count(*)'];

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
        error,
      });
    }
  }
}
