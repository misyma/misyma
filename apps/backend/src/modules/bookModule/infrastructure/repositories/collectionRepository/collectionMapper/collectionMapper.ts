import { type Collection } from '../../../../domain/entities/collection/collection.js';
import { type CollectionRawEntity } from '../../../databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';

export interface CollectionMapper {
  mapToDomain(raw: CollectionRawEntity): Collection;
  mapToPersistence(domain: Collection): CollectionRawEntity;
}
