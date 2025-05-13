import { type BookChangeRequestWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/booksChangeRequestsTable/bookChangeRequestWithJoinsRawEntity.js';
import { type BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface BookChangeRequestMapper {
  mapRawWithJoinsToDomain(entities: BookChangeRequestWithJoinsRawEntity[]): BookChangeRequest[];
}
