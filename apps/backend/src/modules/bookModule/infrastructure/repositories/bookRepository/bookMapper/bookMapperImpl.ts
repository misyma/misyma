import { type BookMapper } from './bookMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
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
      isApproved,
      imageUrl,
      createdAt,
    } = entity;

    return new Book({
      id,
      title,
      isbn,
      releaseYear,
      publisher,
      language,
      translator,
      format,
      pages,
      authors: [],
      isApproved: Boolean(isApproved),
      imageUrl,
      createdAt,
    });
  }

  public mapRawWithJoinsToDomain(entities: BookWithJoinsRawEntity[]): Book[] {
    return entities.map((entity) => {
      const {
        id: bookId,
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        isApproved,
        authorIds,
        authorNames,
        authorApprovals,
        imageUrl,
        createdAt,
      } = entity;

      const bookDraft: BookDraft = {
        id: bookId,
        title,
        isbn: isbn ?? undefined,
        publisher: publisher ?? undefined,
        releaseYear: releaseYear ?? undefined,
        language,
        translator: translator ?? undefined,
        format,
        pages: pages ?? undefined,
        isApproved: Boolean(isApproved),
        createdAt,
        authors:
          authorIds && authorNames && authorApprovals
            ? authorIds
                .filter((authorId) => authorId !== null)
                .map((authorId, index) => {
                  return new Author({
                    id: authorId,
                    name: authorNames[index] as string,
                    isApproved: authorApprovals[index] as boolean,
                  });
                })
            : [],
        imageUrl: imageUrl ?? undefined,
      };

      return new Book(bookDraft);
    });
  }
}
