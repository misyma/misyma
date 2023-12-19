import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookCommandHandlerPayload): Promise<CreateBookCommandHandlerResult> {
    const { title, releaseYear, authorsIds } = payload;

    this.loggerService.debug({
      message: 'Creating book...',
      context: {
        title,
        releaseYear,
        authorsIds,
      },
    });

    const existingBook = await this.bookRepository.findBook({
      title,
      authorsIds,
    });

    if (existingBook) {
      throw new ResourceAlreadyExistsError({
        name: 'Book',
        id: existingBook.id,
        title,
        authorsIds,
      });
    }

    const book = await this.bookRepository.createBook({
      title,
      releaseYear,
      authorsIds,
    });

    this.loggerService.info({
      message: 'Book created.',
      context: {
        bookId: book.id,
        title,
        releaseYear,
        authorsIds,
      },
    });

    return { book };
  }
}
