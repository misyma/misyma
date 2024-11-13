import { type BookChangeRequestMapper } from './bookChangeRequestMapper.js';
import { BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestWithJoinsRawEntity.js';

export class BookChangeRequestMapperImpl implements BookChangeRequestMapper {
  public mapRawWithJoinsToDomain(entities: BookChangeRequestWithJoinsRawEntity[]): BookChangeRequest[] {
    return entities.map((entity) => {
      const {
        id,
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        imageUrl,
        bookId,
        userEmail,
        createdAt,
        authorIds,
        bookTitle,
        changedFields,
      } = entity;

      return new BookChangeRequest({
        id,
        title,
        isbn,
        releaseYear,
        publisher,
        language,
        translator,
        format,
        pages,
        imageUrl,
        bookId,
        userEmail,
        createdAt,
        authorIds: authorIds ? authorIds.split(',') : undefined,
        bookTitle,
        changedFields: changedFields.split(','),
      });
    });
  }
}
