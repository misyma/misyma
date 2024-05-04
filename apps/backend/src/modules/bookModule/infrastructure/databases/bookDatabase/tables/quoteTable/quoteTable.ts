import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class QuoteTable implements DatabaseTable {
  public readonly name = 'quotes';
}
