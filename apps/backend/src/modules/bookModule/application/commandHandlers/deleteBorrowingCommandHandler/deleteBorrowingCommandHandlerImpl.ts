import { type DeleteBorrowingCommandHandler, type DeleteBorrowingPayload } from './deleteBorrowingCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class DeleteBorrowingCommandHandlerImpl implements DeleteBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBorrowingPayload): Promise<void> {
    const { userId, borrowingId } = payload;

    this.loggerService.debug({
      message: 'Deleting Borrowing...',
      id: borrowingId,
      userId,
    });

    const borrowing = await this.borrowingRepository.findBorrowing({ id: borrowingId });

    if (!borrowing) {
      throw new ResourceNotFoundError({
        resource: 'Borrowing',
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

    await this.borrowingRepository.deleteBorrowing({ id: borrowingId });

    this.loggerService.debug({
      message: 'Borrowing deleted.',
      id: borrowingId,
    });
  }
}
