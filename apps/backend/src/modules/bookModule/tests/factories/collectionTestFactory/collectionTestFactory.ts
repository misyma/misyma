import { Generator } from '../../../../../../tests/generator.js';
import { type CollectionState, Collection } from '../../../domain/entities/collection/collection.js';
import { type CollectionRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';

export class CollectionTestFactory {
  public createRaw(overrides: Partial<CollectionRawEntity> = {}): CollectionRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.words().toLowerCase(),
      userId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      ...overrides,
    };
  }

  public create(overrides: Partial<CollectionState> = {}): Collection {
    return new Collection({
      id: Generator.uuid(),
      name: Generator.words().toLowerCase(),
      userId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      ...overrides,
    });
  }
}
