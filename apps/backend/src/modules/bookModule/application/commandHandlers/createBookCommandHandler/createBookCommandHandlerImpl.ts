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
    const {
      authorIds,
      format,
      isApproved,
      language,
      title,
      imageUrl,
      isbn,
      pages,
      publisher,
      releaseYear,
      translator,
    } = payload;

    this.loggerService.debug({
      message: 'Creating Book...',
      authorIds,
      format,
      isApproved,
      language,
      title,
      imageUrl,
      isbn,
      pages,
      publisher,
      releaseYear,
      translator,
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

    if (isbn) {
      const existingBook = await this.bookRepository.findBooks({
        isbn,
        page: 1,
        pageSize: 1,
      });

      if (existingBook.length) {
        throw new OperationNotValidError({
          reason: 'Book with this ISBN already exists.',
          isbn,
          existingBookId: existingBook[0]?.getId(),
        });
      }
    }

    const book = await this.bookRepository.saveBook({
      book: {
        format,
        isApproved,
        language,
        title,
        imageUrl,
        isbn,
        pages,
        publisher,
        releaseYear,
        translator,
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
