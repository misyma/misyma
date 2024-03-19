import { type UserBook } from '../../../../domain/entities/userBook/userBook.js';
import { type UserBookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

export interface UserBookMapper {
  mapRawWithJoinsToDomain(rawEntities: UserBookWithJoinsRawEntity[]): UserBook[];
}
