import { Generator } from '../../../../../../tests/generator.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { Book, type BookDraft } from '../../../domain/entities/book/book.js';
import { Genre } from '../../../domain/entities/genre/genre.js';

export class BookTestFactory {
  public create(input: Partial<BookDraft> = {}): Book {
    const genre = new Genre({
      id: Generator.uuid(),
      name: Generator.title(),
    });
    return new Book({
      id: Generator.uuid(),
      genreId: genre.getId(),
      genre,
      title: Generator.title(),
      isbn: Generator.isbn(),
      publisher: Generator.publisher(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      isApproved: Generator.boolean(),
      imageUrl: Generator.imageUrl(),
      createdAt: Generator.pastDate(),
      authors: [],
      ...input,
    });
  }

  public createRaw(input: Partial<BookRawEntity> = {}): BookRawEntity {
    return {
      id: Generator.uuid(),
      genreId: Generator.uuid(),
      title: Generator.title(),
      isbn: Generator.isbn(),
      publisher: Generator.publisher(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      releaseYear: Generator.number(1970, 2024),
      isApproved: Generator.boolean(),
      imageUrl: Generator.imageUrl(),
      createdAt: Generator.pastDate(),
      ...input,
    };
  }
}
