import {
  type FindBooksQueryHandlerPayload,
  type FindBooksQueryHandler,
  type FindBooksQueryHandlerResult,
} from './findBooksQueryHandler.js';
import {
  type FindBooksPayload,
  type BookRepository,
} from '../../../domain/repositories/bookRepository/bookRepository.js';

export class FindBooksQueryHandlerImpl implements FindBooksQueryHandler {
  public constructor(private readonly bookRepository: BookRepository) {}

  public async execute(payload: FindBooksQueryHandlerPayload): Promise<FindBooksQueryHandlerResult> {
    const { isbn, title, page, pageSize, isApproved, authorIds, language, releaseYearAfter, releaseYearBefore } =
      payload;

    let findBooksPayload: FindBooksPayload = {
      page,
      pageSize,
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

    if (authorIds) {
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
