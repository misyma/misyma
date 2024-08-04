import { Generator } from '../../../../../../tests/generator.js';
import {
  type BookChangeRequestDraft,
  BookChangeRequest,
} from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';

export class BookChangeRequestTestFactory {
  public create(input: Partial<BookChangeRequestDraft> = {}): BookChangeRequest {
    return new BookChangeRequest({
      id: Generator.uuid(),
      title: Generator.word(),
      isbn: Generator.isbn(),
      publisher: Generator.word(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      imageUrl: Generator.imageUrl(),
      bookId: Generator.uuid(),
      userId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      authorIds: [],
      ...input,
    });
  }

  public createRaw(input: Partial<BookChangeRequestRawEntity> = {}): BookChangeRequestRawEntity {
    return {
      id: Generator.uuid(),
      title: Generator.word(),
      isbn: Generator.isbn(),
      publisher: Generator.word(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      imageUrl: Generator.imageUrl(),
      bookId: Generator.uuid(),
      userId: Generator.uuid(),
      createdAt: Generator.pastDate(),
      ...input,
    };
  }
}
