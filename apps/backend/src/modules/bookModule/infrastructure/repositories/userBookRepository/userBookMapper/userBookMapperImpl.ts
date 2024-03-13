import { type UserBookMapper } from './userBookMapper.js';
import { Author } from '../../../../../authorModule/domain/entities/author/author.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { UserBook, type UserBookDraft } from '../../../../domain/entities/userBook/userBook.js';
import { type UserBookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/userBookTable/userBookWithJoinsRawEntity.js';

export class UserBookMapperImpl implements UserBookMapper {
  public mapRawWithJoinsToDomain(entities: UserBookWithJoinsRawEntity[]): UserBook[] {
    const userBookDraftsMapping = new Map<string, UserBookDraft>();

    entities.forEach((entity) => {
      const {
        userBookId,
        imageUrl,
        status,
        bookshelfId,
        bookId,
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        authorId,
        firstName,
        lastName,
        genreId,
        genreName,
      } = entity;

      const userBookExists = userBookDraftsMapping.has(userBookId);

      if (userBookExists) {
        const userBookDraft = userBookDraftsMapping.get(userBookId) as UserBookDraft;

        if (authorId) {
          userBookDraft.book?.authors?.push(
            new Author({
              firstName: firstName as string,
              id: authorId,
              lastName: lastName as string,
            }),
          );
        }

        if (genreId && genreName) {
          userBookDraft.book?.genres?.push(
            new Genre({
              id: genreId,
              name: genreName,
            }),
          );
        }
      } else {
        const authors: Author[] = [];

        const genres: Genre[] = [];

        if (authorId) {
          authors.push(
            new Author({
              firstName: firstName as string,
              id: authorId,
              lastName: lastName as string,
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
          id: userBookId,
          book: {
            title,
            isbn: isbn ?? undefined,
            publisher: publisher ?? undefined,
            releaseYear: releaseYear ?? undefined,
            language,
            translator: translator ?? undefined,
            format,
            pages: pages ?? undefined,
            authors,
            genres,
          },
          bookId,
          imageUrl: imageUrl ?? undefined,
          status,
          bookshelfId,
        };

        userBookDraftsMapping.set(bookId, userBookDraft);
      }
    });

    return [...userBookDraftsMapping.values()].map((userBookDraft) => new UserBook(userBookDraft));
  }
}
