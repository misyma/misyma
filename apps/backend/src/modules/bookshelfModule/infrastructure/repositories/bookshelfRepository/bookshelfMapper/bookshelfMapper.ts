import { type Bookshelf } from '../../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRawEntity } from '../../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { type BookshelfWithJoinsRawEntity } from '../../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfWithJoinsRawEntity.js';

export interface BookshelfMapper {
  mapToDomain(rawEntity: BookshelfRawEntity): Bookshelf;
  mapRawWithJoinsToDomain(rawEntities: BookshelfWithJoinsRawEntity[]): Bookshelf[];
}
