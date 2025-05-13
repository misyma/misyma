import { type BookFormat } from '@common/contracts';

import { type UserBookWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/userBookTable/userBookWithJoinsRawEntity.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { Category } from '../../../../domain/entities/category/category.js';
import { UserBook, type UserBookDraft } from '../../../../domain/entities/userBook/userBook.js';

import { type UserBookMapper } from './userBookMapper.js';

export class UserBookMapperImpl implements UserBookMapper {
  public mapRawWithJoinsToDomain(entity: UserBookWithJoinsRawEntity): UserBook {
    const {
      id,
      image_url: imageUrl,
      status,
      is_favorite: isFavorite,
      bookshelf_id: bookshelfId,
      created_at: createdAt,
      book_id: bookId,
      category_id: categoryId,
      category_name: categoryName,
      title,
      isbn,
      publisher,
      release_year: releaseYear,
      language,
      translator,
      format,
      is_approved: isApproved,
      pages,
      book_image_url: bookImageUrl,
      author_ids: authorIds,
      author_names: authorNames,
      author_approvals: authorApprovals,
      latest_rating: latestRating,
    } = entity;

    const userBookDraft: UserBookDraft = {
      id,
      imageUrl: imageUrl ?? undefined,
      status,
      isFavorite,
      bookshelfId,
      createdAt,
      bookId,
      book: {
        id: bookId,
        title,
        isbn: isbn ?? undefined,
        publisher: publisher ?? undefined,
        releaseYear,
        language,
        translator: translator ?? undefined,
        format: format as BookFormat,
        pages: pages ?? undefined,
        isApproved,
        category: new Category({
          id: categoryId,
          name: categoryName,
        }),
        categoryId,
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
        imageUrl: bookImageUrl ?? undefined,
      },
      latestRating: latestRating ?? undefined,
    };

    return new UserBook(userBookDraft);
  }
}
