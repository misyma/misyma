import {
  type CreateBorrowingCommandHandler,
  type CreateBorrowingPayload,
  type CreateBorrowingResult,
} from './createBorrowingCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';

export class CreateBorrowingCommandHandlerImpl implements CreateBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
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

    const borrowing = await this.borrowingRepository.saveBorrowing({
      borrowing: {
        userBookId,
        borrower,
        startedAt,
        endedAt,
      },
    });

    this.loggerService.debug({
      message: 'Borrowing created.',
      id: borrowing.getId(),
      userBookId,
      borrower,
      startedAt,
      endedAt,
    });

    return { borrowing };
  }
}
