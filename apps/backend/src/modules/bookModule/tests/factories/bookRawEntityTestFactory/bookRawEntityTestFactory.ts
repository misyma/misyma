import { Generator } from '@common/tests';

import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';

export class BookRawEntityTestFactory {
  public create(input: Partial<BookRawEntity> = {}): BookRawEntity {
    return {
      id: Generator.uuid(),
      title: Generator.word(),
      releaseYear: Generator.number(1970, 2024),
      ...input,
    };
  }
}
