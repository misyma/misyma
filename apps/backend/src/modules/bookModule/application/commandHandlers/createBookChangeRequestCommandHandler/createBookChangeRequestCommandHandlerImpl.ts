import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

import {
  type CreateBookChangeRequestCommandHandler,
  type CreateBookChangeRequestCommandHandlerPayload,
  type CreateBookChangeRequestCommandHandlerResult,
} from './createBookChangeRequestCommandHandler.js';

export class CreateBookChangeRequestCommandHandlerImpl implements CreateBookChangeRequestCommandHandler {
  public constructor(
    private readonly bookChangeRequestRepository: BookChangeRequestRepository,
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(
    payload: CreateBookChangeRequestCommandHandlerPayload,
  ): Promise<CreateBookChangeRequestCommandHandlerResult> {
    const { bookId, userId, ...updateData } = payload;

    if (Object.keys(updateData).length === 0) {
      throw new OperationNotValidError({
        reason: 'No book data provided to create a change request.',
        bookId,
        userId,
      });
    }

    const { format, language, title, imageUrl, isbn, pages, publisher, releaseYear, translator, authorIds } =
      updateData;

    this.loggerService.debug({
      message: 'Creating BookChangeRequest...',
      bookId,
      userId,
      format,
      language,
      title,
      imageUrl,
      isbn,
      pages,
      publisher,
      releaseYear,
      translator,
    });

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookId,
      });
    }

    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User does not exist.',
        id: userId,
      });
    }

    if (authorIds) {
      if (authorIds.length === 0) {
        throw new OperationNotValidError({
          reason: 'Authors cannot be empty.',
          authorIds,
        });
      }

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
    }

    const currentDate = new Date();

    const changedFields = Object.entries(updateData)
      .map(([key, value]) => (value !== undefined ? key : undefined))
      .filter((key) => key !== undefined);

    const bookChangeRequest = await this.bookChangeRequestRepository.saveBookChangeRequest({
      bookChangeRequest: {
        bookId,
        userEmail: user.getEmail(),
        createdAt: currentDate,
        format,
        language,
        title,
        imageUrl: imageUrl || undefined,
        isbn: isbn || undefined,
        pages: pages || undefined,
        publisher: publisher || undefined,
        releaseYear: releaseYear || undefined,
        translator: translator || undefined,
        authorIds,
        changedFields,
      },
    });

    this.loggerService.debug({
      message: 'BookChangeRequest created.',
      bookId,
      userEmail: user.getEmail(),
      bookChangeRequestId: bookChangeRequest.getId(),
    });

    return { bookChangeRequest };
  }
}
