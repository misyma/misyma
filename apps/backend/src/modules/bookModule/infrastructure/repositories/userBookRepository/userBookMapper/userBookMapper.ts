import { type UserBookWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/userBookTable/userBookWithJoinsRawEntity.js';
import { type UserBook } from '../../../../domain/entities/userBook/userBook.js';

export interface UserBookMapper {
  mapRawWithJoinsToDomain(rawEntities: UserBookWithJoinsRawEntity): UserBook;
}
