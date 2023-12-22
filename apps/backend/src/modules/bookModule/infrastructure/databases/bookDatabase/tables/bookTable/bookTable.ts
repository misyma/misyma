import { type BookRawEntity } from './bookRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookTable implements DatabaseTable<BookRawEntity> {
  public readonly name = 'books';
  public readonly columns = {
    id: 'id',
    title: 'title',
    releaseYear: 'releaseYear',
  } as const;

  public readonly authorJoinColumns = {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
  };

  public readonly authorJoinColumnsAliases = {
    authorId: 'authorId',
  };
}
