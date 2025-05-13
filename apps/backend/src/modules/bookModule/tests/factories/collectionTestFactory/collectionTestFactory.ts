import { Generator } from '../../../../../../tests/generator.js';
import { type CollectionRawEntity } from '../../../../databaseModule/infrastructure/tables/collectionsTable/collectionRawEntity.js';
import { type CollectionState, Collection } from '../../../domain/entities/collection/collection.js';

export class CollectionTestFactory {
  public createRaw(overrides: Partial<CollectionRawEntity> = {}): CollectionRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.words().toLowerCase(),
      user_id: Generator.uuid(),
      created_at: Generator.pastDate(),
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
