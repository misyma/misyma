import { type AuthorRawEntity } from './authorRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class AuthorTable implements DatabaseTable<AuthorRawEntity> {
  public readonly name = 'authors';
  public readonly columns = {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
  } as const;
}
