import {
  type CreateBookChangeRequestCommandHandler,
  type CreateBookChangeRequestCommandHandlerPayload,
  type CreateBookChangeRequestCommandHandlerResult,
} from './createBookChangeRequestCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class CreateBookChangeRequestCommandHandlerImpl implements CreateBookChangeRequestCommandHandler {
  public constructor(
    private readonly bookChangeRequestRepository: BookChangeRequestRepository,
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(
    payload: CreateBookChangeRequestCommandHandlerPayload,
  ): Promise<CreateBookChangeRequestCommandHandlerResult> {
    const { format, language, title, imageUrl, isbn, pages, publisher, releaseYear, translator, bookId, userId } =
      payload;

    this.loggerService.debug({
      message: 'Creating BookChangeRequest...',
      format,
      language,
      title,
      imageUrl,
      isbn,
      pages,
      publisher,
      releaseYear,
      translator,
      bookId,
      userId,
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

    const currentDate = new Date();

    const bookChangeRequest = await this.bookChangeRequestRepository.saveBookChangeRequest({
      bookChangeRequest: {
        bookId,
        userId,
        createdAt: currentDate,
        format,
        language,
        title,
        imageUrl,
        isbn,
        pages,
        publisher,
        releaseYear,
        translator,
      },
    });

    this.loggerService.debug({
      message: 'BookChangeRequest created.',
      bookChangeRequestId: bookChangeRequest.getId(),
    });

    return { bookChangeRequest };
  }
}
