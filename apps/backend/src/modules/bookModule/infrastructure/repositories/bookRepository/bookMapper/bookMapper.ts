import { type Book } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithAuthorRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithAuthorRawEntity.js';

export interface BookMapper {
  mapRawToDomain(rawEntity: BookRawEntity): Book;
  mapRawWithAuthorToDomain(rawEntities: BookWithAuthorRawEntity[]): Book[];
}
