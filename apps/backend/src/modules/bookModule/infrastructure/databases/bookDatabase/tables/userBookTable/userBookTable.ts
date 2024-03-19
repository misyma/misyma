import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserBookTable implements DatabaseTable {
  public readonly name = 'userBooks';
}
