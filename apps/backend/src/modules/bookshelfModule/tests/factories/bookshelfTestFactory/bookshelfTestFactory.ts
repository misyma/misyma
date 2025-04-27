import { bookshelfTypes } from '@common/contracts';

import { Generator } from '../../../../../../tests/generator.js';
import { type BookshelfRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';

export class BookshelfTestFactory {
  public create(input: Partial<BookshelfState> = {}): Bookshelf {
    return new Bookshelf({
      id: Generator.uuid(),
      name: Generator.words(3),
      userId: Generator.uuid(),
      type: bookshelfTypes.standard,
      createdAt: Generator.pastDate(),
      imageUrl: Generator.imageUrl(),
      ...input,
    });
  }

  public createRaw(input: Partial<BookshelfRawEntity> = {}): BookshelfRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.words(3),
      userId: Generator.uuid(),
      type: bookshelfTypes.standard,
      createdAt: Generator.pastDate(),
      imageUrl: Generator.imageUrl(),
      ...input,
    };
  }
}
