import {
  type CreateUserBookCommandHandler,
  type CreateUserBookCommandHandlerPayload,
  type CreateUserBookCommandHandlerResult,
} from './createUserBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class CreateUserBookCommandHandlerImpl implements CreateUserBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateUserBookCommandHandlerPayload): Promise<CreateUserBookCommandHandlerResult> {
    const { bookshelfId, bookId, status, imageUrl } = payload;

    this.loggerService.debug({
      message: 'Creating UserBook...',
      bookshelfId,
      bookId,
      status,
      imageUrl,
    });

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!bookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      });
    }

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookId,
      });
    }

    const userBook = await this.userBookRepository.saveUserBook({
      userBook: {
        bookId,
        bookshelfId,
        status,
        imageUrl,
      },
    });

    this.loggerService.debug({
      message: 'UserBook created.',
      id: userBook.getId(),
      bookshelfId,
      bookId,
    });

    return { userBook };
  }
}
