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
        id,
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
        isApproved,
        pages,
        authorId,
        authorName,
        isAuthorApproved,
        genreId,
        genreName,
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
      } else {
        const authors: Author[] = [];

        const genres: Genre[] = [];

        if (authorId) {
          authors.push(
            new Author({
              id: authorId,
              name: authorName as string,
              isApproved: Boolean(isAuthorApproved),
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
          },
          bookId,
          imageUrl: imageUrl ?? undefined,
          status,
          bookshelfId,
          genres,
        };

        userBookDraftsMapping.set(bookId, userBookDraft);
      }
    });

    return [...userBookDraftsMapping.values()].map((userBookDraft) => new UserBook(userBookDraft));
  }
}
