import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

import {
  type CreateCollectionCommandHandler,
  type CreateCollectionPayload,
  type CreateCollectionResult,
} from './createCollectionCommandHandler.js';

export class CreateCollectionCommandHandlerImpl implements CreateCollectionCommandHandler {
  public constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateCollectionPayload): Promise<CreateCollectionResult> {
    const { name, userId } = payload;

    this.loggerService.debug({
      message: 'Creating Collection...',
      name,
      userId,
    });

    const collectionExists = await this.collectionRepository.findCollection({
      name,
      userId,
    });

    if (collectionExists) {
      throw new ResourceAlreadyExistsError({
        resource: 'Collection',
        name,
        userId,
      });
    }

    const collection = await this.collectionRepository.saveCollection({
      collection: {
        name,
        userId,
        createdAt: new Date(),
      },
    });

    this.loggerService.debug({
      message: 'Collection created.',
      id: collection.getId(),
      name,
      userId,
    });

    return { collection };
  }
}
