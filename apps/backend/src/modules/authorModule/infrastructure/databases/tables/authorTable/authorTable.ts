import { type DatabaseTable } from '../../../../../../common/types/databaseTable.js';

export class AuthorTable implements DatabaseTable {
  public readonly name = 'authors';
}
