import { Author } from '../../../../domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithJoinsRawEntity.js';

import { type BookMapper } from './bookMapper.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
    const {
      id,
      genreId,
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      isApproved,
      imageUrl,
      createdAt,
    } = entity;

    return new Book({
      id,
      title,
      isbn,
      releaseYear,
      publisher,
      language,
      translator,
      format: format ?? undefined,
      pages,
      authors: [],
      isApproved,
      imageUrl,
      createdAt,
      genreId,
      genre: new Genre({
        id: genreId,
        name: ""
      })
    });
  }

  public mapRawWithJoinsToDomain(entities: BookWithJoinsRawEntity[]): Book[] {
    return entities.map((entity) => {
      const {
        id: bookId,
        genreId,
        genreName,
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        isApproved,
        authorIds,
        authorNames,
        authorApprovals,
        authorCreatedAtDates,
        imageUrl,
        createdAt,
      } = entity;

      const bookDraft: BookDraft = {
        id: bookId,
        genreId,
        genre: new Genre({
          id: genreId,
          name: genreName
        }),
        title,
        isbn: isbn ?? undefined,
        publisher: publisher ?? undefined,
        releaseYear,
        language,
        translator: translator ?? undefined,
        format,
        pages: pages ?? undefined,
        isApproved,
        createdAt,
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
        imageUrl: imageUrl ?? undefined,
      };

      return new Book(bookDraft);
    });
  }
}
