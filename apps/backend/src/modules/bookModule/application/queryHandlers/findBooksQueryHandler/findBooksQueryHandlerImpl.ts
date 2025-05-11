import {
  type FindBooksPayload,
  type BookRepository,
} from '../../../domain/repositories/bookRepository/bookRepository.js';

import {
  type FindBooksQueryHandlerPayload,
  type FindBooksQueryHandler,
  type FindBooksQueryHandlerResult,
} from './findBooksQueryHandler.js';

export class FindBooksQueryHandlerImpl implements FindBooksQueryHandler {
  public constructor(private readonly bookRepository: BookRepository) {}

  public async execute(payload: FindBooksQueryHandlerPayload): Promise<FindBooksQueryHandlerResult> {
    const {
      page,
      pageSize,
      sortField,
      sortOrder,
      authorIds,
      excludeOwned,
      isApproved,
      isbn,
      language,
      releaseYearAfter,
      releaseYearBefore,
      title,
      userId,
    } = payload;

    let findBooksPayload: FindBooksPayload = {
      page,
      pageSize,
      sortField,
      sortOrder,
    };

    if (isbn) {
      findBooksPayload = {
        ...findBooksPayload,
        isbn,
      };
    }

    if (title) {
      findBooksPayload = {
        ...findBooksPayload,
        title,
      };
    }

    if (isApproved !== undefined) {
      findBooksPayload = {
        ...findBooksPayload,
        isApproved,
      };
    }

    if (excludeOwned && userId) {
      findBooksPayload = {
        ...findBooksPayload,
        excludeOwnedByUserId: userId,
      };
    }

    if (authorIds && authorIds.length > 0) {
      findBooksPayload = {
        ...findBooksPayload,
        authorIds,
      };
    }

    if (language) {
      findBooksPayload = {
        ...findBooksPayload,
        language,
      };
    }

    if (releaseYearAfter) {
      findBooksPayload = {
        ...findBooksPayload,
        releaseYearAfter,
      };
    }

    if (releaseYearBefore) {
      findBooksPayload = {
        ...findBooksPayload,
        releaseYearBefore,
      };
    }

    const [books, total] = await Promise.all([
      this.bookRepository.findBooks(findBooksPayload),
      this.bookRepository.countBooks(findBooksPayload),
    ]);

    return {
      books,
      total,
    };
  }
}
