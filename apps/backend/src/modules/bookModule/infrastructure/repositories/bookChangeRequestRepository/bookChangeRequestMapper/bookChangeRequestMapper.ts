import { type BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestRawEntity } from '../../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';

export interface BookChangeRequestMapper {
  mapToDomain(rawEntity: BookChangeRequestRawEntity): BookChangeRequest;
}
