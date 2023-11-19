import { type Book } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';

export interface BookMapper {
  mapToDomain(rawEntity: BookRawEntity): Book;
}
