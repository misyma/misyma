import { type BookshelfMapper } from './bookshelfMapper.js';
import { Bookshelf } from '../../../../domain/repositories/entities/bookshelf/bookshelf.js';
import { type BookshelfRawEntity } from '../../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';

export class BookshelfMapperImpl implements BookshelfMapper {
  public mapToDomain({ id, name, userId, addressId }: BookshelfRawEntity): Bookshelf {
    return new Bookshelf({
      id,
      name,
      userId,
      addressId,
    });
  }
}
