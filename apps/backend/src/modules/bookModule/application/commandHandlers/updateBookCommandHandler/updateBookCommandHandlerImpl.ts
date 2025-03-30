import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

import {
  type UpdateBookCommandHandler,
  type UpdateBookPayload,
  type UpdateBookResult,
} from './updateBookCommandHandler.js';

export class UpdateBookCommandHandlerImpl implements UpdateBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookPayload): Promise<UpdateBookResult> {
    const {
      bookId,
      genreId,
      authorIds,
      format,
      imageUrl,
      language,
      pages,
      publisher,
      releaseYear,
      title,
      translator,
      isApproved,
      isbn,
    } = payload;

    this.loggerService.debug({
      message: 'Updating Book...',
      bookId,
      authorIds,
      format,
      imageUrl,
      language,
      pages,
      publisher,
      releaseYear,
      title,
      translator,
      isApproved,
      isbn,
    });

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookId,
      });
    }

    if (title) {
      book.setTitle({ title });
    }

    if (authorIds?.length) {
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

    if (isApproved !== undefined) {
      book.setIsApproved({ isApproved });
    }

    if (isbn) {
      book.setIsbn({ isbn });
    }

    await this.bookRepository.saveBook({ book });

    this.loggerService.debug({
      message: 'Book updated.',
      bookId,
    });

    return { book };
  }
}
