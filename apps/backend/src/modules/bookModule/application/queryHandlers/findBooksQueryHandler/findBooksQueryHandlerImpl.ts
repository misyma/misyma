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
    const { page, pageSize, ...rest } = payload;

    let findBooksPayload: FindBooksPayload = {
      page,
      pageSize,
    };

    Object.entries(rest).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        findBooksPayload = {
          ...findBooksPayload,
          [key]: val,
        };
      }
    });

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
