import {
  type ApplyBookChangeRequestCommandHandler,
  type ApplyBookChangeRequestPayload,
} from './applyBookChangeRequestCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class ApplyBookChangeRequestCommandHandlerImpl implements ApplyBookChangeRequestCommandHandler {
  public constructor(
    private readonly bookChangeRequestRepository: BookChangeRequestRepository,
    private readonly bookRepository: BookRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ApplyBookChangeRequestPayload): Promise<void> {
    const { bookChangeRequestId } = payload;

    this.loggerService.debug({
      message: 'Applying BookChangeRequest...',
      bookChangeRequestId,
    });

    const bookChangeRequest = await this.bookChangeRequestRepository.findBookChangeRequest({ id: bookChangeRequestId });

    if (!bookChangeRequest) {
      throw new OperationNotValidError({
        reason: 'BookChangeRequest does not exist.',
        id: bookChangeRequestId,
      });
    }

    const book = await this.bookRepository.findBook({ id: bookChangeRequest.getBookId() });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookChangeRequest.getBookId(),
      });
    }

    const { format, imageUrl, isbn, language, pages, publisher, translator, releaseYear, title, authorIds } =
      bookChangeRequest.getState();

    if (title) {
      book.setTitle({ title });
    }

    if (language) {
      book.setLanguage({ language });
    }

    if (format) {
      book.setFormat({ format });
    }

    if (pages) {
      book.setPages({ pages });
    }

    if (publisher) {
      book.setPublisher({ publisher });
    }

    if (releaseYear) {
      book.setReleaseYear({ releaseYear });
    }

    if (translator) {
      book.setTranslator({ translator });
    }

    if (imageUrl) {
      book.setImageUrl({ imageUrl });
    }

    if (isbn) {
      book.setIsbn({ isbn });
    }

    if (authorIds !== undefined) {
      if (authorIds.length) {
        const authors = await this.authorRepository.findAuthors({
          ids: authorIds,
          page: 1,
          pageSize: authorIds.length,
        });

        if (authors.length !== authorIds.length) {
          throw new OperationNotValidError({
            reason: 'Some authors do not exist.',
            authorIds,
          });
        }

        book.setAuthors(authors);
      }
    }

    await this.bookRepository.saveBook({ book });

    this.loggerService.debug({
      message: 'BookChangeRequest applied.',
      bookChangeRequestId,
      bookId: bookChangeRequest.getBookId(),
    });
  }
}
