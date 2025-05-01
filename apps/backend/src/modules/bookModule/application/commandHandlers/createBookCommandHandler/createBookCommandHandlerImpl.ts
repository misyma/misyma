import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

import {
  type CreateBookCommandHandler,
  type CreateBookCommandHandlerPayload,
  type CreateBookCommandHandlerResult,
} from './createBookCommandHandler.js';

export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookCommandHandlerPayload): Promise<CreateBookCommandHandlerResult> {
    const {
      authorIds,
      categoryId,
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
      categoryId,
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
    });

    if (authorIds.length !== authors.length) {
      const missingIds = authorIds.filter((authorId) => !authors.some((author) => author.getId() === authorId));

      throw new OperationNotValidError({
        reason: 'Provided Authors do not exist.',
        missingIds,
      });
    }

    if (isbn) {
      const existingBooks = await this.bookRepository.findBooks({
        isbn,
        isApproved: true,
        page: 1,
        pageSize: 1,
      });

      if (existingBooks.length) {
        throw new ResourceAlreadyExistsError({
          resource: 'Book',
          isbn,
          existingBookId: existingBooks[0]?.getId(),
        });
      }
    }

    const book = await this.bookRepository.saveBook({
      book: {
        categoryId,
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
