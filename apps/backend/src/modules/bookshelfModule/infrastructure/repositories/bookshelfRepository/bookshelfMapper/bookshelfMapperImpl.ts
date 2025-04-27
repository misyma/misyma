import { type BookshelfRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { type BookshelfWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfWithJoinsRawEntity.js';
import { Bookshelf } from '../../../../domain/entities/bookshelf/bookshelf.js';

import { type BookshelfMapper } from './bookshelfMapper.js';

export class BookshelfMapperImpl implements BookshelfMapper {
  public mapToDomain({ id, name, userId, type, createdAt, imageUrl }: BookshelfRawEntity): Bookshelf {
    return new Bookshelf({
      id,
      name,
      userId,
      type,
      createdAt,
      imageUrl,
    });
  }

  public mapRawWithJoinsToDomain(rawEntities: BookshelfWithJoinsRawEntity[]): Bookshelf[] {
    return rawEntities.map((entity) => {
      const { id, name, userId, type, createdAt, imageUrl, bookCount } = entity;

      return new Bookshelf({
        id,
        name,
        userId,
        type,
        createdAt,
        imageUrl,
        bookCount: parseInt(bookCount, 10),
      });
    });
  }
}
