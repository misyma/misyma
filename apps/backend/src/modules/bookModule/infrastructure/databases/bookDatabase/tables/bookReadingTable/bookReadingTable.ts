import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookReadingTable implements DatabaseTable {
  public readonly name = 'bookReadings';
}
