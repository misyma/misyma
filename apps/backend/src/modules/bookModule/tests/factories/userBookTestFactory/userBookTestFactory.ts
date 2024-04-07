import { type ReadingStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { UserBook, type UserBookDraft } from '../../../domain/entities/userBook/userBook.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';

export class UserBookTestFactory {
  public create(input: Partial<UserBookDraft> = {}): UserBook {
    return new UserBook({
      id: Generator.uuid(),
      imageUrl: Generator.imageUrl(),
      status: Generator.bookReadingStatus() as ReadingStatus,
      bookshelfId: Generator.uuid(),
      bookId: Generator.uuid(),
      genres: [],
      ...input,
    });
  }

  public createRaw(input: Partial<UserBookRawEntity> = {}): UserBookRawEntity {
    return {
      id: Generator.uuid(),
      imageUrl: Generator.imageUrl(),
      status: Generator.bookReadingStatus() as ReadingStatus,
      bookshelfId: Generator.uuid(),
      bookId: Generator.uuid(),
      ...input,
    };
  }
}
