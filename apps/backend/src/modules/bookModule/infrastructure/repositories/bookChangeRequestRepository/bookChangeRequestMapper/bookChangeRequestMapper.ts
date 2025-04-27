import { type BookChangeRequestWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookChangeRequestTable/bookChangeRequestWithJoinsRawEntity.js';
import { type BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface BookChangeRequestMapper {
  mapRawWithJoinsToDomain(entities: BookChangeRequestWithJoinsRawEntity[]): BookChangeRequest[];
}
