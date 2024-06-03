import { type DeleteCollectionCommandHandler, type DeleteCollectionPayload } from './deleteCollectionCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

export class DeleteCollectionCommandHandlerImpl implements DeleteCollectionCommandHandler {
  public constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteCollectionPayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting Collection...',
      id,
    });

    const collection = await this.collectionRepository.findCollection({
      id,
    });

    if (!collection) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id,
      });
    }

    await this.collectionRepository.deleteCollection({ id: collection.getId() });

    this.loggerService.debug({
      message: 'Collection deleted.',
      id,
    });
  }
}
