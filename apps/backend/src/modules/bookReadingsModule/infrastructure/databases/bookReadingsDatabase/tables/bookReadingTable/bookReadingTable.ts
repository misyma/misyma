import { type BookReadingRawEntity } from './bookReadingRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookReadingTable implements DatabaseTable<BookReadingRawEntity> {
  public readonly name = 'bookReadings';
  public readonly columns = {
    id: 'id',
    bookId: 'bookId',
    rating: 'rating',
    comment: 'comment',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
  } as const;
}
