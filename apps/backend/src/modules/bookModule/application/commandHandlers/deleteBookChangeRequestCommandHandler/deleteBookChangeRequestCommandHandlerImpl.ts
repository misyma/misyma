import {
  type DeleteBookChangeRequestCommandHandler,
  type DeleteBookChangeRequestCommandHandlerPayload,
} from './deleteBookChangeRequestCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';

export class DeleteBookChangeRequestCommandHandlerImpl implements DeleteBookChangeRequestCommandHandler {
  public constructor(
    private readonly bookChangeRequestRepository: BookChangeRequestRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookChangeRequestCommandHandlerPayload): Promise<void> {
    const { bookChangeRequestId } = payload;

    this.loggerService.debug({
      message: 'Deleting bookChangeRequest...',
      bookChangeRequestId,
    });

    const existingBookChangeRequest = await this.bookChangeRequestRepository.findBookChangeRequest({
      id: bookChangeRequestId,
    });

    if (!existingBookChangeRequest) {
      throw new ResourceNotFoundError({
        resource: 'BookChangeRequest',
        id: bookChangeRequestId,
      });
    }

    await this.bookChangeRequestRepository.deleteBookChangeRequest({ id: bookChangeRequestId });

    this.loggerService.debug({
      message: 'BookChangeRequest deleted.',
      bookChangeRequestId,
    });
  }
}
