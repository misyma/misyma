import { type UpdateUserBooksCommandHandler, type UpdateUserBooksPayload } from './updateUserBooksCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class UpdateUserBooksCommandHandlerImpl implements UpdateUserBooksCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateUserBooksPayload): Promise<void> {
    const { data } = payload;

    this.loggerService.debug({
      message: 'Updating UserBooks...',
      data,
    });

    const ids = data.map((userBook) => userBook.userBookId);

    const userBooks = await this.userBookRepository.findUserBooks({
      ids,
      page: 1,
      pageSize: ids.length,
    });

    if (userBooks.length !== ids.length) {
      throw new OperationNotValidError({
        reason: 'Some of the UserBooks do not exist.',
        ids,
      });
    }

    // TODO: check if bookshelves are from the same user
    const bookshelfIds = data.map((userBook) => userBook.bookshelfId);

    const bookshelves = await this.bookshelfRepository.findBookshelves({
      ids: bookshelfIds,
      page: 1,
      pageSize: bookshelfIds.length,
    });

    const uniqueIds = new Set(bookshelfIds);

    if (bookshelves.length !== uniqueIds.size) {
      throw new OperationNotValidError({
        reason: 'Some of the Bookshelves do not exist.',
        ids: bookshelfIds,
      });
    }

    userBooks.forEach((userBook) => {
      const userBookUpdateData = data.find((ub) => ub.userBookId === userBook.getId());

      if (userBookUpdateData) {
        userBook.setBookshelfId({ bookshelfId: userBookUpdateData.bookshelfId });
      }
    });

    await this.userBookRepository.saveUserBooks({ userBooks });

    this.loggerService.debug({
      message: 'UserBooks updated.',
      data,
    });
  }
}
