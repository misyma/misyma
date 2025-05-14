import { type CollectionRawEntity } from '../../../../../databaseModule/infrastructure/tables/collectionsTable/collectionRawEntity.js';
import { type Collection } from '../../../../domain/entities/collection/collection.js';

export interface CollectionMapper {
  mapToDomain(raw: CollectionRawEntity): Collection;
}
