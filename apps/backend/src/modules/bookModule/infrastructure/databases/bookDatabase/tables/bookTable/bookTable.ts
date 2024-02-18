import { type BookRawEntity } from './bookRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BookTable implements DatabaseTable<BookRawEntity> {
  public readonly name = 'books';
  public readonly columns = {
    id: 'id',
    title: 'title',
    isbn: 'isbn',
    publisher: 'publisher',
    releaseYear: 'releaseYear',
    language: 'language',
    translator: 'translator',
    format: 'format',
    pages: 'pages',
    frontCoverImageUrl: 'frontCoverImageUrl',
    backCoverImageUrl: 'backCoverImageUrl',
    status: 'status',
    bookshelfId: 'bookshelfId',
  } as const;

  public readonly authorJoinColumns = {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
  };

  public readonly authorJoinColumnsAliases = {
    authorId: 'authorId',
  };

  public readonly genreJoinColumns = {
    id: 'id',
    name: 'name',
  };

  public readonly genreJoinColumnsAliases = {
    genreId: 'genreId',
    genreName: 'genreName',
  };
}
