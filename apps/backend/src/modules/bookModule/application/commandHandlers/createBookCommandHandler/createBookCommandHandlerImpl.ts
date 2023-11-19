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
    const { title, releaseYear, authorId } = payload;

    this.loggerService.debug({
      message: 'Creating book...',
      context: {
        title,
        releaseYear,
        authorId,
      },
    });

    const existingBook = await this.bookRepository.findBook({
      title,
      authorId,
    });

    if (existingBook) {
      throw new ResourceAlreadyExistsError({
        name: 'Book',
        id: existingBook.id,
        title,
        authorId,
      });
    }

    const book = await this.bookRepository.createBook({
      title,
      releaseYear,
      authorId,
    });

    this.loggerService.info({
      message: 'Book created.',
      context: {
        bookId: book.id,
        title,
        releaseYear,
        authorId,
      },
    });

    return { book };
  }
}
