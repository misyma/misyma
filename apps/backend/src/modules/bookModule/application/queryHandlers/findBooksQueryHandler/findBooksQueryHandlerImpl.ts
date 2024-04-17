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
    const { isbn, title } = payload;

    let findBooksPayload: FindBooksPayload = {
      isApproved: true,
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

    const books = await this.bookRepository.findBooks(findBooksPayload);

    return { books };
  }
}
