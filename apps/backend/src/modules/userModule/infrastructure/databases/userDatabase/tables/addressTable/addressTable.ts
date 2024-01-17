import { type AddressRawEntity } from './addressRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class AddressTable implements DatabaseTable<AddressRawEntity> {
  public readonly name = 'addresses';

  public readonly columns = {
    id: 'id',
    country: 'country',
    city: 'city',
    postalCode: 'postalCode',
    streetAddress: 'streetAddress',
    userId: 'userId',
  };
}
