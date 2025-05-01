import { type BookChangeRequestWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookChangeRequestTable/bookChangeRequestWithJoinsRawEntity.js';
import { BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

import { type BookChangeRequestMapper } from './bookChangeRequestMapper.js';

export class BookChangeRequestMapperImpl implements BookChangeRequestMapper {
  public mapRawWithJoinsToDomain(entities: BookChangeRequestWithJoinsRawEntity[]): BookChangeRequest[] {
    return entities.map((entity) => {
      const {
        id,
        title,
        isbn,
        publisher,
        release_year: releaseYear,
        language,
        translator,
        format,
        pages,
        image_url: imageUrl,
        book_id: bookId,
        user_email: userEmail,
        created_at: createdAt,
        author_ids: authorIds,
        book_title: bookTitle,
        changed_fields: changedFields,
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
