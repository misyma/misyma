import { type BookMapper } from './bookMapper.js';
import { Author } from '../../../../../authorModule/domain/entities/author/author.js';
import { Book } from '../../../../domain/entities/book/book.js';
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
    const booksMap = new Map<string, Book>();

    entities.forEach((entity) => {
      const { authorId, firstName, id, lastName, releaseYear, title } = entity;

      const bookExists = booksMap.has(id);

      if (bookExists) {
        const book = booksMap.get(id) as Book;

        book.addAuthor({
          id: authorId,
          firstName,
          lastName,
        });
      } else {
        const author = new Author({
          firstName,
          id: authorId,
          lastName,
        });

        const book = new Book({
          id,
          title,
          releaseYear,
          authors: [author],
        });

        booksMap.set(id, book);
      }
    });

    return [...booksMap.values()];
  }
}
