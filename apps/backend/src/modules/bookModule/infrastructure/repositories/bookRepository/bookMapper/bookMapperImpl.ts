import { type BookRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { type BookWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookTable/bookWithJoinsRawEntity.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { Book, type BookDraft } from '../../../../domain/entities/book/book.js';
import { Category } from '../../../../domain/entities/category/category.js';

import { type BookMapper } from './bookMapper.js';

export class BookMapperImpl implements BookMapper {
  public mapRawToDomain(entity: BookRawEntity): Book {
    const {
      id,
      category_id: categoryId,
      title,
      isbn,
      publisher,
      release_year: releaseYear,
      language,
      translator,
      format,
      pages,
      is_approved: isApproved,
      image_url: imageUrl,
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
      categoryId,
      category: new Category({
        id: categoryId,
        name: '',
      }),
    });
  }

  public mapRawWithJoinsToDomain(entities: BookWithJoinsRawEntity[]): Book[] {
    return entities.map((entity) => {
      const {
        id: bookId,
        category_id: categoryId,
        category_name: categoryName,
        title,
        isbn,
        publisher,
        release_year: releaseYear,
        language,
        translator,
        format,
        pages,
        is_approved: isApproved,
        image_url: imageUrl,
        author_ids: authorIds,
        author_names: authorNames,
        author_approvals: authorApprovals,
      } = entity;

      const bookDraft: BookDraft = {
        id: bookId,
        categoryId,
        category: new Category({
          id: categoryId,
          name: categoryName,
        }),
        title,
        isbn: isbn ?? undefined,
        publisher: publisher ?? undefined,
        releaseYear,
        language,
        translator: translator ?? undefined,
        format: format ?? undefined,
        pages: pages ?? undefined,
        isApproved,
        authors:
          authorIds && authorNames && authorApprovals
            ? authorIds
                .filter((authorId) => authorId !== null)
                .map((authorId, index) => {
                  return new Author({
                    id: authorId,
                    name: authorNames[index] as string,
                    isApproved: authorApprovals[index] as boolean,
                  });
                })
            : [],
        imageUrl: imageUrl ?? undefined,
      };

      return new Book(bookDraft);
    });
  }
}
