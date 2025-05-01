import { Generator } from '../../../../../../tests/generator.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { Book, type BookDraft } from '../../../domain/entities/book/book.js';
import { Category } from '../../../domain/entities/category/category.js';

export class BookTestFactory {
  public create(input: Partial<BookDraft> = {}): Book {
    const category = new Category({
      id: Generator.uuid(),
      name: Generator.title(),
    });
    return new Book({
      id: Generator.uuid(),
      categoryId: category.getId(),
      category,
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
      authors: [],
      ...input,
    });
  }

  public createRaw(input: Partial<BookRawEntity> = {}): BookRawEntity {
    return {
      id: Generator.uuid(),
      category_id: Generator.uuid(),
      title: Generator.title(),
      isbn: Generator.isbn(),
      publisher: Generator.publisher(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      release_year: Generator.number(1970, 2024),
      is_approved: Generator.boolean(),
      image_url: Generator.imageUrl(),
      ...input,
    };
  }
}
