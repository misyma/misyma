import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookshelfTable implements DatabaseTable {
  public readonly name = 'bookshelves';
}
