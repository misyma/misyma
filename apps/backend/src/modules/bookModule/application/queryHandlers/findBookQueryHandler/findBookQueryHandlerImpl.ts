import {
  type FindBookQueryHandler,
  type FindBookQueryHandlerPayload,
  type FindBookQueryHandlerResult,
} from './findBookQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class FindBookQueryHandlerImpl implements FindBookQueryHandler {
  public constructor(private readonly bookRepository: BookRepository) {}

  public async execute(payload: FindBookQueryHandlerPayload): Promise<FindBookQueryHandlerResult> {
    const { bookId } = payload;

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    return { book };
  }
}
