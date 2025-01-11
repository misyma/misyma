import { BookshelfType } from '@common/contracts';

import { Generator } from '../../../../../../tests/generator.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';

export class BookshelfTestFactory {
  public create(input: Partial<BookshelfState> = {}): Bookshelf {
    return new Bookshelf({
      id: Generator.uuid(),
      name: Generator.alphaString(20, 'lower'),
      userId: Generator.uuid(),
      type: BookshelfType.standard,
      createdAt: Generator.pastDate(),
      imageUrl: Generator.imageUrl(),
      ...input,
    });
  }

  public createRaw(input: Partial<BookshelfRawEntity> = {}): BookshelfRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.alphaString(20, 'lower'),
      userId: Generator.uuid(),
      type: BookshelfType.standard,
      createdAt: Generator.pastDate(),
      imageUrl: Generator.imageUrl(),
      ...input,
    };
  }
}
