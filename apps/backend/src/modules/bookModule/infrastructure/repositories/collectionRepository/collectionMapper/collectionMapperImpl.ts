import { type CollectionRawEntity } from '../../../../../databaseModule/infrastructure/tables/collectionTable/collectionRawEntity.js';
import { Collection } from '../../../../domain/entities/collection/collection.js';

import { type CollectionMapper } from './collectionMapper.js';

export class CollectionMapperImpl implements CollectionMapper {
  public mapToDomain(raw: CollectionRawEntity): Collection {
    return new Collection({
      id: raw.id,
      name: raw.name,
      userId: raw.user_id,
      createdAt: raw.created_at,
    });
  }
}
