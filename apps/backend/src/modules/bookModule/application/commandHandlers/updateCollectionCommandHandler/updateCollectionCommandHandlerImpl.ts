import {
  type UpdateCollectionCommandHandler,
  type UpdateCollectionPayload,
  type UpdateCollectionResult,
} from './updateCollectionCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

export class UpdateCollectionCommandHandlerImpl implements UpdateCollectionCommandHandler {
  public constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateCollectionPayload): Promise<UpdateCollectionResult> {
    const { id, name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Updating Collection name...',
      id,
      name: normalizedName,
    });

    const existingCollection = await this.collectionRepository.findCollection({ id });

    if (!existingCollection) {
      throw new OperationNotValidError({
        reason: 'Collection does not exist.',
        id,
      });
    }

    const nameTaken = await this.collectionRepository.findCollection({
      name: normalizedName,
    });

    if (nameTaken) {
      throw new ResourceAlreadyExistsError({
        resource: 'Collection',
        name,
      });
    }

    existingCollection.setName({ name: normalizedName });

    const collection = await this.collectionRepository.saveCollection({
      collection: existingCollection,
    });

    this.loggerService.debug({
      message: 'Collection name updated.',
      id,
      name: normalizedName,
    });

    return {
      collection,
    };
  }
}
