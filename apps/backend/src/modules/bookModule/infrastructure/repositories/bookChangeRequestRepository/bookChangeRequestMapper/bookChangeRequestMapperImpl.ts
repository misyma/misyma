import { type BookChangeRequestMapper } from './bookChangeRequestMapper.js';
import { BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestRawEntity } from '../../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';

export class BookChangeRequestMapperImpl implements BookChangeRequestMapper {
  public mapToDomain(entity: BookChangeRequestRawEntity): BookChangeRequest {
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
      userId,
      createdAt,
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
      userId,
      createdAt: new Date(createdAt),
    });
  }
}
