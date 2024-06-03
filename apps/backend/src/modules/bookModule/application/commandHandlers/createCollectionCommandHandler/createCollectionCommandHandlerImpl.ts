import {
  type CreateCollectionCommandHandler,
  type CreateCollectionPayload,
  type CreateCollectionResult,
} from './createCollectionCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

export class CreateCollectionCommandHandlerImpl implements CreateCollectionCommandHandler {
  public constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateCollectionPayload): Promise<CreateCollectionResult> {
    const { name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Creating Collection...',
      name,
    });

    const collectionExists = await this.collectionRepository.findCollection({
      name: normalizedName,
    });

    if (collectionExists) {
      throw new ResourceAlreadyExistsError({
        resource: 'Collection',
        name: normalizedName,
      });
    }

    const collection = await this.collectionRepository.saveCollection({
      collection: {
        name: normalizedName,
      },
    });

    this.loggerService.debug({
      message: 'Collection created.',
      id: collection.getId(),
      name: normalizedName,
    });

    return { collection };
  }
}
