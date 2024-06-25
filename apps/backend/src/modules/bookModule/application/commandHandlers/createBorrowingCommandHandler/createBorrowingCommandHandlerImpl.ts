import { BookshelfType } from '@common/contracts';

import {
  type CreateBorrowingCommandHandler,
  type CreateBorrowingPayload,
  type CreateBorrowingResult,
} from './createBorrowingCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';

export class CreateBorrowingCommandHandlerImpl implements CreateBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBorrowingPayload): Promise<CreateBorrowingResult> {
    const { userBookId, borrower, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Creating Borrowing...',
      userBookId,
      borrower,
      startedAt,
      endedAt,
    });

    const existingUserBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!existingUserBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
      });
    }

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: existingUserBook.getBookshelfId() },
    });

    if (!existingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: existingUserBook.getBookshelfId(),
      });
    }

    const borrowingBookshelves = await this.bookshelfRepository.findBookshelves({
      userId: existingBookshelf.getUserId(),
      type: BookshelfType.borrowing,
      page: 1,
      pageSize: 1,
    });

    const borrowingBookshelf = borrowingBookshelves[0];

    if (!borrowingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Borrowing Bookshelf does not exist.',
        userId: existingBookshelf.getUserId(),
      });
    }

    if (endedAt && startedAt.getTime() > endedAt.getTime()) {
      throw new OperationNotValidError({
        reason: `Start date cannot be later than end date.`,
        startedAt,
        endedAt,
      });
    }

    // TODO: add transaction

    const borrowing = await this.borrowingRepository.saveBorrowing({
      borrowing: {
        userBookId,
        borrower,
        startedAt,
        endedAt,
      },
    });

    existingUserBook.setBookshelfId({ bookshelfId: borrowingBookshelf.getId() });

    await this.userBookRepository.saveUserBook({ userBook: existingUserBook });

    this.loggerService.debug({
      message: 'Borrowing created.',
      id: borrowing.getId(),
      userBookId,
      borrower,
      startedAt,
      endedAt,
      bookshelfId: borrowingBookshelf.getId(),
    });

    return { borrowing };
  }
}
