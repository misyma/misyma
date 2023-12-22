import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindAuthorsByIdsQueryHandler } from '../../../../authorModule/application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandler.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly findAuthorsByIdsQueryHandler: FindAuthorsByIdsQueryHandler,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookCommandHandlerPayload): Promise<CreateBookCommandHandlerResult> {
    const { title, releaseYear, authorIds } = payload;

    this.loggerService.debug({
      message: 'Creating book...',
      context: {
        title,
        releaseYear,
        authorIds,
      },
    });

    const existingBook = await this.bookRepository.findBook({
      title,
      authorIds,
    });

    if (existingBook) {
      throw new ResourceAlreadyExistsError({
        name: 'Book',
        id: existingBook.id,
        title,
        authorIds,
      });
    }

    const { authors } = await this.findAuthorsByIdsQueryHandler.execute({
      authorIds,
    });

    const book = await this.bookRepository.createBook({
      title,
      releaseYear,
      authors,
    });

    this.loggerService.info({
      message: 'Book created.',
      context: {
        bookId: book.id,
        title,
        releaseYear,
        authorIds,
      },
    });

    return { book };
  }
}
