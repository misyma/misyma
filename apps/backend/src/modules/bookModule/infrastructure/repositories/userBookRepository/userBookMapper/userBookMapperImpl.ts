import { type UserBookMapper } from './userBookMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { Collection } from '../../../../domain/entities/collection/collection.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { UserBook, type UserBookDraft } from '../../../../domain/entities/userBook/userBook.js';
import { type UserBookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

export class UserBookMapperImpl implements UserBookMapper {
  public mapRawWithJoinsToDomain(entities: UserBookWithJoinsRawEntity[]): UserBook[] {
    const userBookDraftsMapping = new Map<string, UserBookDraft>();

    entities.forEach((entity) => {
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
        authorId,
        authorName,
        isAuthorApproved,
        genreId,
        genreName,
        collectionId,
        collectionName,
        collectionCreatedAt,
        userId,
        readingId,
        readingStartedAt,
        readingEndedAt,
        readingRating,
        readingComment,
      } = entity;

      const userBookExists = userBookDraftsMapping.has(id);

      if (userBookExists) {
        const userBookDraft = userBookDraftsMapping.get(id) as UserBookDraft;

        if (authorId) {
          userBookDraft.book?.authors?.push(
            new Author({
              id: authorId,
              name: authorName as string,
              isApproved: Boolean(isAuthorApproved),
            }),
          );
        }

        if (genreId && genreName) {
          userBookDraft.genres?.push(
            new Genre({
              id: genreId,
              name: genreName,
            }),
          );
        }

        if (collectionId && collectionName && userId && collectionCreatedAt) {
          userBookDraft.collections?.push(
            new Collection({
              id: collectionId,
              name: collectionName,
              userId,
              createdAt: new Date(collectionCreatedAt),
            }),
          );
        }

        if (readingId && readingStartedAt && readingRating && readingEndedAt) {
          userBookDraft.readings?.push(
            new BookReading({
              id: readingId,
              startedAt: new Date(readingStartedAt),
              endedAt: new Date(readingEndedAt),
              rating: readingRating,
              comment: readingComment ?? undefined,
              userBookId: id,
            }),
          );
        }
      } else {
        const authors: Author[] = [];

        const genres: Genre[] = [];

        const readings: BookReading[] = [];

        const collections: Collection[] = [];

        if (authorId) {
          authors.push(
            new Author({
              id: authorId,
              name: authorName as string,
              isApproved: Boolean(isAuthorApproved),
            }),
          );
        }

        if (readingId && readingStartedAt && readingRating && readingEndedAt) {
          readings.push(
            new BookReading({
              id: readingId,
              startedAt: new Date(readingStartedAt),
              endedAt: new Date(readingEndedAt),
              rating: readingRating,
              comment: readingComment ?? undefined,
              userBookId: id,
            }),
          );
        }

        if (genreId && genreName) {
          genres.push(
            new Genre({
              id: genreId,
              name: genreName,
            }),
          );
        }

        if (collectionId && collectionName && userId && collectionCreatedAt) {
          collections.push(
            new Collection({
              id: collectionId,
              name: collectionName,
              userId,
              createdAt: new Date(collectionCreatedAt),
            }),
          );
        }

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
            authors,
            imageUrl: bookImageUrl ?? undefined,
          },
          genres,
          readings,
          collections,
        };

        userBookDraftsMapping.set(id, userBookDraft);
      }
    });

    return [...userBookDraftsMapping.values()].map((userBookDraft) => new UserBook(userBookDraft));
  }
}
