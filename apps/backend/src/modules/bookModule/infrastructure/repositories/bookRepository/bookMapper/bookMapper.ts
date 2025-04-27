import { type BookRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookTable/bookWithJoinsRawEntity.js';
import { type Book } from '../../../../domain/entities/book/book.js';

export interface BookMapper {
  mapRawToDomain(rawEntity: BookRawEntity): Book;
  mapRawWithJoinsToDomain(rawEntities: BookWithJoinsRawEntity[]): Book[];
}
