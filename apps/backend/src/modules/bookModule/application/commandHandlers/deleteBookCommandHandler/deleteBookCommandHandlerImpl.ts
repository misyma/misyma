import { type DeleteBookCommandHandler, type DeleteBookCommandHandlerPayload } from './deleteBookCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class DeleteBookCommandHandlerImpl implements DeleteBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookCommandHandlerPayload): Promise<void> {
    const { bookId } = payload;

    this.loggerService.debug({
      message: 'Deleting book...',
      context: { bookId },
    });

    await this.bookRepository.deleteBook({ id: bookId });

    this.loggerService.info({
      message: 'Book deleted.',
      context: { bookId },
    });
  }
}
