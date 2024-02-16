import { type BookGenresRawEntity } from './bookGenresRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookGenresTable implements DatabaseTable<BookGenresRawEntity> {
  public readonly name = 'bookGenres';

  public readonly columns = {
    id: 'id',
    bookId: 'bookId',
    genreId: 'genreId',
  } as const;
}
