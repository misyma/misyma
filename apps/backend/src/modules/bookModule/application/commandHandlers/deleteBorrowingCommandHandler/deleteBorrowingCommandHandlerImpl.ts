import { type DeleteBorrowingCommandHandler, type DeleteBorrowingPayload } from './deleteBorrowingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';

export class DeleteBorrowingCommandHandlerImpl implements DeleteBorrowingCommandHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBorrowingPayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting Borrowing...',
      id,
    });

    const borrowing = await this.borrowingRepository.findBorrowing({ id });

    if (!borrowing) {
      throw new ResourceNotFoundError({
        resource: 'Borrowing',
        id,
      });
    }

    await this.borrowingRepository.deleteBorrowing({ id });

    this.loggerService.debug({
      message: 'Borrowing deleted.',
      id,
    });
  }
}
