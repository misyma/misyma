import { type BookMapper } from './bookMapper.js';
import { Author } from '../../../../../authorModule/domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithAuthorRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithAuthorRawEntity.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
    const { id, title, releaseYear } = entity;

    return new Book({
      id,
      title,
      releaseYear,
    });
  }

  public mapRawWithAuthorToDomain(entities: BookWithAuthorRawEntity[]): Book[] {
    const bookDraftsMap = new Map<string, BookDraft>();

    entities.forEach((entity) => {
      const { authorId, firstName, id, lastName, releaseYear, title } = entity;

      const bookExists = bookDraftsMap.has(id);

      if (bookExists) {
        const bookDraft = bookDraftsMap.get(id) as BookDraft;

        if (authorId) {
          bookDraft.authors?.push(
            new Author({
              firstName: firstName as string,
              id: authorId,
              lastName: lastName as string,
            }),
          );
        }
      } else {
        const authors: Author[] = [];

        if (authorId) {
          authors.push(
            new Author({
              firstName: firstName as string,
              id: authorId,
              lastName: lastName as string,
            }),
          );
        }

        const book = {
          id,
          title,
          releaseYear,
          authors,
        };

        bookDraftsMap.set(id, book);
      }
    });

    return [...bookDraftsMap.values()].map((bookDraft) => new Book(bookDraft));
  }
}
