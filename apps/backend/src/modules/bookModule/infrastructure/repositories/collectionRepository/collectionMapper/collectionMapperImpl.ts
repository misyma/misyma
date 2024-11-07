import { type CollectionMapper } from './collectionMapper.js';
import { Collection } from '../../../../domain/entities/collection/collection.js';
import { type CollectionRawEntity } from '../../../databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';

export class CollectionMapperImpl implements CollectionMapper {
  public mapToDomain(raw: CollectionRawEntity): Collection {
    return new Collection({
      id: raw.id,
      name: raw.name,
      userId: raw.userId,
      createdAt: raw.createdAt,
    });
  }

  public mapToPersistence(domain: Collection): CollectionRawEntity {
    return {
      id: domain.getId(),
      name: domain.getName(),
      userId: domain.getUserId(),
      createdAt: domain.getCreatedAt(),
    };
  }
}
