import { type CollectionRawEntity } from '../../../../../databaseModule/infrastructure/tables/collectionTable/collectionRawEntity.js';
import { type Collection } from '../../../../domain/entities/collection/collection.js';

export interface CollectionMapper {
  mapToDomain(raw: CollectionRawEntity): Collection;
  mapToPersistence(domain: Collection): CollectionRawEntity;
}
