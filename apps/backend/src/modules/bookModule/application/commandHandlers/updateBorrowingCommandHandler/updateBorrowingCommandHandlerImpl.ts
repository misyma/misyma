import {
  type UpdateBorrowingCommandHandler,
  type UpdateBorrowingPayload,
  type UpdateBorrowingResult,
} from './updateBorrowingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';

export class UpdateBorrowingCommandHandlerImpl implements UpdateBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBorrowingPayload): Promise<UpdateBorrowingResult> {
    const { id, borrower, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Updating Borrowing...',
      id,
      borrower,
      startedAt,
      endedAt,
    });

    const borrowing = await this.borrowingRepository.findBorrowing({ id });

    if (!borrowing) {
      throw new ResourceNotFoundError({
        resource: 'Borrowing',
        id,
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
      id,
      borrower,
      startedAt,
      endedAt,
    });

    return {
      borrowing: updatedBorrowing,
    };
  }
}
