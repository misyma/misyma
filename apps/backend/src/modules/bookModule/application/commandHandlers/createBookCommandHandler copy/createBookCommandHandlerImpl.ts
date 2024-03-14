import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindAuthorsByIdsQueryHandler } from '../../../../authorModule/application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandler.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly findAuthorsByIdsQueryHandler: FindAuthorsByIdsQueryHandler,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookCommandHandlerPayload): Promise<CreateBookCommandHandlerResult> {
    const { bookshelfId, authorIds, ...bookData } = payload;

    this.loggerService.debug({
      message: 'Creating Book...',
      bookshelfId,
      authorIds,
      ...bookData,
    });

    const { authors } = await this.findAuthorsByIdsQueryHandler.execute({
      authorIds,
    });

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        name: 'Bookshelf',
        id: bookshelfId,
      });
    }

    const book = await this.bookRepository.saveBook({
      book: {
        ...bookData,
        bookshelfId,
        authors,
        genres: [],
      },
    });

    this.loggerService.debug({
      message: 'Book created.',
      bookId: book.getId(),
      bookshelfId,
      authorIds,
    });

    return { book };
  }
}
