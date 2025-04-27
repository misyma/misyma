import { type BookshelfRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { type BookshelfWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfWithJoinsRawEntity.js';
import { type Bookshelf } from '../../../../domain/entities/bookshelf/bookshelf.js';

export interface BookshelfMapper {
  mapToDomain(rawEntity: BookshelfRawEntity): Bookshelf;
  mapRawWithJoinsToDomain(rawEntities: BookshelfWithJoinsRawEntity[]): Bookshelf[];
}
