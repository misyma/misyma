import { type Book } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

export interface BookMapper {
  mapRawToDomain(rawEntity: BookRawEntity): Book;
  mapRawWithJoinsToDomain(rawEntities: BookWithJoinsRawEntity[]): Book[];
}
