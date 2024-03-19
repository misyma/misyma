import { type BookMapper } from './bookMapper.js';
import { Author } from '../../../../../authorModule/domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
    const { id, title, isbn, publisher, releaseYear, language, translator, format, pages } = entity;

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
      genres: [],
    });
  }

  public mapRawWithJoinsToDomain(entities: BookWithJoinsRawEntity[]): Book[] {
    const bookDraftsMap = new Map<string, BookDraft>();

    entities.forEach((entity) => {
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
        authorId,
        firstName,
        lastName,
        genreId,
        genreName,
      } = entity;

      const bookExists = bookDraftsMap.has(bookId);

      if (bookExists) {
        const bookDraft = bookDraftsMap.get(bookId) as BookDraft;

        if (authorId) {
          bookDraft.authors?.push(
            new Author({
              firstName: firstName as string,
              id: authorId,
              lastName: lastName as string,
            }),
          );
        }

        if (genreId && genreName) {
          bookDraft.genres?.push(
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
          authors,
          genres,
        };

        bookDraftsMap.set(bookId, bookDraft);
      }
    });

    return [...bookDraftsMap.values()].map((bookDraft) => new Book(bookDraft));
  }
}
