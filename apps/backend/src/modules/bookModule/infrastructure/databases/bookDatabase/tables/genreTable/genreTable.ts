import { type GenreRawEntity } from './genreRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class GenreTable implements DatabaseTable<GenreRawEntity> {
  public name = 'genres';

  public readonly columns = {
    id: 'id',
    name: 'name',
  } as const;
}
