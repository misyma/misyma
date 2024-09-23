import { type BookChangeRequestMapper } from './bookChangeRequestMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
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
        bookIsbn,
        bookPublisher,
        bookReleaseYear,
        bookLanguage,
        bookTranslator,
        bookFormat,
        bookIsApproved,
        bookPages,
        bookImageUrl,
        bookCreatedAt,
        bookAuthorIds,
        bookAuthorNames,
        bookAuthorApprovals,
        bookAuthorCreatedAtDates,
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
        createdAt: new Date(createdAt),
        authorIds: authorIds ? authorIds.split(',') : undefined,
        book: {
          id: bookId,
          title: bookTitle,
          isbn: bookIsbn ?? undefined,
          publisher: bookPublisher ?? undefined,
          releaseYear: bookReleaseYear ?? undefined,
          language: bookLanguage,
          translator: bookTranslator ?? undefined,
          format: bookFormat,
          pages: bookPages ?? undefined,
          isApproved: bookIsApproved,
          createdAt: bookCreatedAt,
          authors:
            bookAuthorIds && bookAuthorNames && bookAuthorApprovals && bookAuthorCreatedAtDates
              ? bookAuthorIds
                  .filter((bookAuthorId) => bookAuthorId !== null)
                  .map((bookAuthorId, index) => {
                    return new Author({
                      id: bookAuthorId,
                      name: bookAuthorNames[index] as string,
                      isApproved: bookAuthorApprovals[index] as boolean,
                      createdAt: bookAuthorCreatedAtDates[index] as Date,
                    });
                  })
              : [],
          imageUrl: bookImageUrl ?? undefined,
        },
      });
    });
  }
}
