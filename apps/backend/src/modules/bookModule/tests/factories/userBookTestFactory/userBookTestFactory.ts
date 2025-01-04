import { Generator } from '../../../../../../tests/generator.js';
import { UserBook, type UserBookDraft } from '../../../domain/entities/userBook/userBook.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';

export class UserBookTestFactory {
  public create(input: Partial<UserBookDraft> = {}): UserBook {
    return new UserBook({
      id: Generator.uuid(),
      imageUrl: Generator.imageUrl(),
      status: Generator.readingStatus(),
      isFavorite: Generator.boolean(),
      bookshelfId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      bookId: Generator.uuid(),
      genreId: Generator.uuid(),
      readings: [],
      collections: [],
      ...input,
    });
  }

  public createRaw(input: Partial<UserBookRawEntity> = {}): UserBookRawEntity {
    return {
      id: Generator.uuid(),
      imageUrl: Generator.imageUrl(),
      status: Generator.readingStatus(),
      isFavorite: Generator.boolean(),
      bookshelfId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      bookId: Generator.uuid(),
      genreId: Generator.uuid(),
      ...input,
    };
  }
}
