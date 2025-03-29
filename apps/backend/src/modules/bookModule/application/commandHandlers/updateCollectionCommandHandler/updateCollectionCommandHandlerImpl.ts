import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

import {
  type UpdateCollectionCommandHandler,
  type UpdateCollectionPayload,
  type UpdateCollectionResult,
} from './updateCollectionCommandHandler.js';

export class UpdateCollectionCommandHandlerImpl implements UpdateCollectionCommandHandler {
  public constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateCollectionPayload): Promise<UpdateCollectionResult> {
    const { id, name } = payload;

    this.loggerService.debug({
      message: 'Updating Collection...',
      id,
      name,
    });

    const existingCollection = await this.collectionRepository.findCollection({ id });

    if (!existingCollection) {
      throw new OperationNotValidError({
        reason: 'Collection does not exist.',
        id,
      });
    }

    const nameTaken = await this.collectionRepository.findCollection({
      name,
      userId: existingCollection.getUserId(),
    });

    if (nameTaken) {
      throw new ResourceAlreadyExistsError({
        resource: 'Collection',
        name,
      });
    }

    existingCollection.setName({ name });

    const collection = await this.collectionRepository.saveCollection({ collection: existingCollection });

    this.loggerService.debug({
      message: 'Collection updated.',
      id,
      name,
    });

    return { collection };
  }
}
