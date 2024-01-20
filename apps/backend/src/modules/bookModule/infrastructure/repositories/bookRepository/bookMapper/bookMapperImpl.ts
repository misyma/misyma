import { type BookFormat, type BookStatus } from '@common/contracts';

import { type BookMapper } from './bookMapper.js';
import { Author } from '../../../../../authorModule/domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type BookWithAuthorRawEntity } from '../../../databases/bookDatabase/tables/bookTable/bookWithAuthorRawEntity.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
    const {
      id,
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      frontCoverImageUrl,
      backCoverImageUrl,
      status,
      bookshelfId,
    } = entity;

    return new Book({
      id,
      title,
      isbn,
      releaseYear,
      publisher,
      language,
      translator,
      format: format as BookFormat,
      pages,
      frontCoverImageUrl,
      backCoverImageUrl,
      status: status as BookStatus,
      bookshelfId,
    });
  }

  public mapRawWithAuthorToDomain(entities: BookWithAuthorRawEntity[]): Book[] {
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
        frontCoverImageUrl,
        backCoverImageUrl,
        status,
        bookshelfId,
        authorId,
        firstName,
        lastName,
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

        const bookDraft: BookDraft = {
          id: bookId,
          title,
          isbn: isbn ?? undefined,
          publisher: publisher ?? undefined,
          releaseYear: releaseYear ?? undefined,
          language,
          translator: translator ?? undefined,
          format: format as BookFormat,
          pages: pages ?? undefined,
          frontCoverImageUrl: frontCoverImageUrl ?? undefined,
          backCoverImageUrl: backCoverImageUrl ?? undefined,
          status: status as BookStatus,
          bookshelfId,
          authors,
        };

        bookDraftsMap.set(bookId, bookDraft);
      }
    });

    return [...bookDraftsMap.values()].map((bookDraft) => new Book(bookDraft));
  }
}
