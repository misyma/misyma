import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type UpdateBorrowingCommandHandler,
  type UpdateBorrowingPayload,
  type UpdateBorrowingResult,
} from './updateBorrowingCommandHandler.js';

export class UpdateBorrowingCommandHandlerImpl implements UpdateBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBorrowingPayload): Promise<UpdateBorrowingResult> {
    const { userId, borrowingId, borrower, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Updating Borrowing...',
      id: borrowingId,
      userId,
      borrower,
      startedAt,
      endedAt,
    });

    const borrowing = await this.borrowingRepository.findBorrowing({ id: borrowingId });

    if (!borrowing) {
      throw new OperationNotValidError({
        reason: 'Borrowing does not exist.',
        id: borrowingId,
      });
    }

    const { userId: ownerId } = await this.userBookRepository.findUserBookOwner({
      id: borrowing.getUserBookId(),
    });

    if (userId !== ownerId) {
      throw new OperationNotValidError({
        reason: 'User does not own the Borrowing.',
        userId,
        borrowingId,
      });
    }

    if (borrower !== undefined) {
      borrowing.setBorrower({
        borrower,
      });
    }

    if (startedAt !== undefined && endedAt !== undefined) {
      borrowing.setBorrowingDates({
        startedAt,
        endedAt,
      });
    } else {
      if (startedAt !== undefined) {
        borrowing.setStartedAtDate({
          startedAt,
        });
      }

      if (endedAt !== undefined) {
        borrowing.setEndedAtDate({
          endedAt,
        });
      }
    }

    const updatedBorrowing = await this.borrowingRepository.saveBorrowing({
      borrowing,
    });

    this.loggerService.debug({
      message: 'Borrowing updated.',
      id: borrowingId,
      borrower,
      startedAt,
      endedAt,
    });

    return {
      borrowing: updatedBorrowing,
    };
  }
}
