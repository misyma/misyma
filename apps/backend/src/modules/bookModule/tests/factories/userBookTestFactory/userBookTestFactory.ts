import { Generator } from '../../../../../../tests/generator.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/userBookRawEntity.js';
import { UserBook, type UserBookDraft } from '../../../domain/entities/userBook/userBook.js';

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
      collections: [],
      ...input,
    });
  }

  public createRaw(input: Partial<UserBookRawEntity> = {}): UserBookRawEntity {
    return {
      id: Generator.uuid(),
      image_url: Generator.imageUrl(),
      status: Generator.readingStatus(),
      is_favorite: Generator.boolean(),
      bookshelf_id: Generator.uuid(),
      created_at: Generator.pastDate(),
      book_id: Generator.uuid(),
      ...input,
    };
  }
}
