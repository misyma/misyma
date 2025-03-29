import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

import { type DeleteBookCommandHandler, type DeleteBookCommandHandlerPayload } from './deleteBookCommandHandler.js';

export class DeleteBookCommandHandlerImpl implements DeleteBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookCommandHandlerPayload): Promise<void> {
    const { bookId } = payload;

    this.loggerService.debug({
      message: 'Deleting book...',
      bookId,
    });

    const existingBook = await this.bookRepository.findBook({ id: bookId });

    if (!existingBook) {
      throw new ResourceNotFoundError({
        resource: 'Book',
        id: bookId,
      });
    }

    await this.bookRepository.deleteBook({ id: bookId });

    this.loggerService.debug({
      message: 'Book deleted.',
      bookId,
    });
  }
}
