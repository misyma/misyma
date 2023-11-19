import { type BookMapper } from './bookMapper.js';
import { Book } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';

export class BookMapperImpl implements BookMapper {
  public mapToDomain(entity: BookRawEntity): Book {
    const { id, title, releaseYear, authorId } = entity;

    return new Book({
      id,
      title,
      releaseYear,
      authorId,
    });
  }
}
