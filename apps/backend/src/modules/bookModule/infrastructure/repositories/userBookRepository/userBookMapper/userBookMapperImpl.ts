import { type BookFormat } from '@common/contracts';

import { type UserBookWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/userBookTable/userBookWithJoinsRawEntity.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { Category } from '../../../../domain/entities/category/category.js';
import { Collection } from '../../../../domain/entities/collection/collection.js';
import { UserBook, type UserBookDraft } from '../../../../domain/entities/userBook/userBook.js';

import { type UserBookMapper } from './userBookMapper.js';

export class UserBookMapperImpl implements UserBookMapper {
  public mapRawWithJoinsToDomain(entity: UserBookWithJoinsRawEntity): UserBook {
    const {
      id,
      imageUrl,
      status,
      isFavorite,
      bookshelfId,
      createdAt,
      bookId,
      categoryId,
      categoryName,
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
      authorCreatedAtDates,
      collectionIds,
      collectionNames,
      collectionUserIds,
      collectionCreatedAtDates,
      readingIds,
      readingStartedAtDates,
      readingEndedAtDates,
      readingRatings,
      readingComments,
      latestRating,
    } = entity;

    const userBookDraft: UserBookDraft = {
      id,
      imageUrl: imageUrl ?? undefined,
      status,
      isFavorite,
      bookshelfId,
      createdAt,
      bookId,
      book: {
        id: bookId,
        title,
        isbn: isbn ?? undefined,
        publisher: publisher ?? undefined,
        releaseYear,
        language,
        translator: translator ?? undefined,
        format: format as BookFormat,
        pages: pages ?? undefined,
        isApproved,
        category: new Category({
          id: categoryId,
          name: categoryName,
        }),
        categoryId,
        createdAt: bookCreatedAt,
        authors:
          authorIds && authorNames && authorApprovals && authorCreatedAtDates
            ? authorIds
                .filter((authorId) => authorId !== null)
                .map((authorId, index) => {
                  return new Author({
                    id: authorId,
                    name: authorNames[index] as string,
                    isApproved: authorApprovals[index] as boolean,
                    createdAt: authorCreatedAtDates[index] as Date,
                  });
                })
            : [],
        imageUrl: bookImageUrl ?? undefined,
      },
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
      latestRating: latestRating ?? undefined,
    };

    return new UserBook(userBookDraft);
  }
}
