import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
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
    const { authorIds, ...bookData } = payload;

    this.loggerService.debug({
      message: 'Creating Book...',
      authorIds,
      ...bookData,
    });

    if (authorIds.length === 0) {
      throw new OperationNotValidError({
        reason: 'Book must have at least one author.',
      });
    }

    const { authors } = await this.findAuthorsByIdsQueryHandler.execute({
      authorIds,
      isApproved: true,
      page: 1,
      pageSize: authorIds.length,
    });

    const book = await this.bookRepository.saveBook({
      book: {
        ...bookData,
        authors,
      },
    });

    this.loggerService.debug({
      message: 'Book created.',
      bookId: book.getId(),
    });

    return { book };
  }
}
