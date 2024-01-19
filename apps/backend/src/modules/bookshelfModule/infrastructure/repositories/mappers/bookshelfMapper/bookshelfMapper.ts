import { type Bookshelf } from '../../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRawEntity } from '../../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';

export interface BookshelfMapper {
  mapToDomain(rawEntity: BookshelfRawEntity): Bookshelf;
}
