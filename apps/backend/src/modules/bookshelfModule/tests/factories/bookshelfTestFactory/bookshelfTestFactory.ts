import { Generator } from '@common/tests';

import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';

export class BookshelfTestFactory {
  private constructor() {}

  public static createFactory(): BookshelfTestFactory {
    return new BookshelfTestFactory();
  }

  public create(input: Partial<BookshelfState> = {}): Bookshelf {
    return new Bookshelf({
      id: Generator.uuid(),
      name: Generator.alphaString(20, 'lower'),
      userId: Generator.uuid(),
      addressId: undefined,
      ...input,
    });
  }

  public createRaw(input: Partial<BookshelfRawEntity> = {}): BookshelfRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.alphaString(20, 'lower'),
      userId: Generator.uuid(),
      addressId: undefined,
      ...input,
    };
  }
}
