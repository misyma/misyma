import { type BookshelfRawEntity } from './bookshelfRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookshelfTable implements DatabaseTable<BookshelfRawEntity> {
  public readonly name = 'bookshelfs';
  public readonly columns = {
    id: 'id',
    name: 'name',
    addressId: 'addressId',
    userId: 'userId',
  } as const;
}
