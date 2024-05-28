import { type UserBookMapper } from './userBookMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
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

        if (readingId && readingStartedAt && readingRating && readingComment) {
          userBookDraft.readings?.push(
            new BookReading({
              id: readingId,
              startedAt: readingStartedAt,
              endedAt: readingEndedAt ?? undefined,
              rating: readingRating,
              comment: readingComment,
              userBookId: id,
            }),
          );
        }
      } else {
        const authors: Author[] = [];

        const genres: Genre[] = [];

        const readings: BookReading[] = [];

        if (authorId) {
          authors.push(
            new Author({
              id: authorId,
              name: authorName as string,
              isApproved: Boolean(isAuthorApproved),
            }),
          );
        }

        if (readingId && readingStartedAt && readingRating && readingComment) {
          readings.push(
            new BookReading({
              id: readingId,
              startedAt: readingStartedAt,
              endedAt: readingEndedAt ?? undefined,
              rating: readingRating,
              comment: readingComment,
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

        const userBookDraft: UserBookDraft = {
          id,
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
          bookId,
          imageUrl: imageUrl ?? undefined,
          status,
          isFavorite: Boolean(isFavorite),
          bookshelfId,
          genres,
          readings,
        };

        userBookDraftsMapping.set(id, userBookDraft);
      }
    });

    return [...userBookDraftsMapping.values()].map((userBookDraft) => new UserBook(userBookDraft));
  }
}
