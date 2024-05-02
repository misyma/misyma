import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly authorRepository: AuthorRepository,
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

    const authors = await this.authorRepository.findAuthors({
      ids: authorIds,
      page: 1,
      pageSize: authorIds.length,
      isApproved: true,
    });

    if (authorIds.length !== authors.length) {
      const missingIds = authorIds.filter((authorId) => !authors.some((author) => author.getId() === authorId));

      throw new ResourceNotFoundError({
        resource: 'Author',
        missingIds,
      });
    }

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
