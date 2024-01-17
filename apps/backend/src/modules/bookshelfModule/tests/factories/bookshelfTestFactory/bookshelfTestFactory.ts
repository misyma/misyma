import { Generator } from '@common/tests';

import { Bookshelf, type BookshelfState } from '../../../domain/repositories/entities/bookshelf/bookshelf.js';
import {
  BookshelfDraft,
  type BookshelfDraftState,
} from '../../../domain/repositories/entities/bookshelf/bookshelfDraft/bookshelfDraft.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelfsDatabase/tables/bookshelfTable/bookshelfRawEntity.js';

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

  public createDraft(input: Partial<BookshelfDraftState> = {}): BookshelfDraft {
    return new BookshelfDraft({
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
