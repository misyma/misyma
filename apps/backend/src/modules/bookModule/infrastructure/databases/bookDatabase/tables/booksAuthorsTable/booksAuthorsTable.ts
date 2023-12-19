import { type BooksAuthorsRawEntity } from './booksAuthorsRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BooksAuthorsTable implements DatabaseTable<BooksAuthorsRawEntity> {
  public readonly name = 'booksAuthors';
  public readonly columns = {
    bookId: 'bookId',
    authorId: 'authorId',
  } as const;
}
