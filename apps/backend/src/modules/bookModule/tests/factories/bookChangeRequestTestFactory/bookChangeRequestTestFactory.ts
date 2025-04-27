import { Generator } from '../../../../../../tests/generator.js';
import { type BookChangeRequestRawEntity } from '../../../../databaseModule/infrastructure/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import {
  type BookChangeRequestDraft,
  BookChangeRequest,
} from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export class BookChangeRequestTestFactory {
  public create(input: Partial<BookChangeRequestDraft> = {}): BookChangeRequest {
    return new BookChangeRequest({
      id: Generator.uuid(),
      title: Generator.title(),
      isbn: Generator.isbn(),
      publisher: Generator.publisher(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      imageUrl: Generator.imageUrl(),
      bookId: Generator.email(),
      userEmail: Generator.uuid(),
      createdAt: Generator.pastDate(),
      authorIds: [],
      changedFields: [],
      ...input,
    });
  }

  public createRaw(input: Partial<BookChangeRequestRawEntity> = {}): BookChangeRequestRawEntity {
    return {
      id: Generator.uuid(),
      title: Generator.title(),
      isbn: Generator.isbn(),
      publisher: Generator.publisher(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      imageUrl: Generator.imageUrl(),
      bookId: Generator.uuid(),
      userEmail: Generator.email(),
      createdAt: Generator.pastDate(),
      changedFields: Generator.words(5).split(' ').join(','),
      ...input,
    };
  }
}
