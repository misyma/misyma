import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookTable implements DatabaseTable {
  public readonly name = 'books';
}
