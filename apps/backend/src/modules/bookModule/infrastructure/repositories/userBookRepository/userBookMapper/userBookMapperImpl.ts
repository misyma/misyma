import { type UserBookMapper } from './userBookMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { Collection } from '../../../../domain/entities/collection/collection.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { UserBook, type UserBookDraft } from '../../../../domain/entities/userBook/userBook.js';
import { type UserBookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

export class UserBookMapperImpl implements UserBookMapper {
  public mapRawWithJoinsToDomain(entities: UserBookWithJoinsRawEntity[]): UserBook[] {
    return entities.map((entity) => {
      const {
        id,
        imageUrl,
        status,
        isFavorite,
        bookshelfId,
        createdAt,
        bookId,
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        isApproved,
        pages,
        bookImageUrl,
        bookCreatedAt,
        authorIds,
        authorNames,
        authorApprovals,
        genreIds,
        genreNames,
        collectionIds,
        collectionNames,
        collectionUserIds,
        collectionCreatedAtDates,
        readingIds,
        readingStartedAtDates,
        readingEndedAtDates,
        readingRatings,
        readingComments,
      } = entity;

      const userBookDraft: UserBookDraft = {
        id,
        imageUrl: imageUrl ?? undefined,
        status,
        isFavorite: Boolean(isFavorite),
        bookshelfId,
        createdAt: new Date(createdAt),
        bookId,
        book: {
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
          createdAt: new Date(bookCreatedAt),
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
          imageUrl: bookImageUrl ?? undefined,
        },
        genres:
          genreIds && genreNames
            ? genreIds
                .filter((genreId) => genreId !== null)
                .map((genreId, index) => {
                  return new Genre({
                    id: genreId,
                    name: genreNames[index] as string,
                  });
                })
            : [],
        readings:
          readingIds && readingStartedAtDates && readingEndedAtDates && readingRatings && readingComments
            ? readingIds
                .filter((readingId) => readingId !== null)
                .map((readingId, index) => {
                  return new BookReading({
                    id: readingId,
                    startedAt: readingStartedAtDates[index] as Date,
                    endedAt: readingEndedAtDates[index] as Date,
                    rating: readingRatings[index] as number,
                    comment: readingComments[index] ?? undefined,
                    userBookId: id,
                  });
                })
            : [],
        collections:
          collectionIds && collectionNames && collectionCreatedAtDates && collectionUserIds
            ? collectionIds
                .filter((collectionId) => collectionId !== null)
                .map((collectionId, index) => {
                  return new Collection({
                    id: collectionId,
                    name: collectionNames[index] as string,
                    userId: collectionUserIds[index] as string,
                    createdAt: collectionCreatedAtDates[index] as Date,
                  });
                })
            : [],
      };

      return new UserBook(userBookDraft);
    });
  }
}
