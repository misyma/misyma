import { type BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestWithJoinsRawEntity.js';

export interface BookChangeRequestMapper {
  mapRawWithJoinsToDomain(entities: BookChangeRequestWithJoinsRawEntity[]): BookChangeRequest[];
}
