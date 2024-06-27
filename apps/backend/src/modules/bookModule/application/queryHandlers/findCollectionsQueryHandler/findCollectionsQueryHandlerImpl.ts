import {
  type FindCollectionsQueryHandlerPayload,
  type FindCollectionsQueryHandler,
  type FindCollectionsQueryHandlerResult,
} from './findCollectionsQueryHandler.js';
import {
  type FindCollectionsPayload,
  type CollectionRepository,
} from '../../../domain/repositories/collectionRepository/collectionRepository.js';

export class FindCollectionsQueryHandlerImpl implements FindCollectionsQueryHandler {
  public constructor(private readonly collectionRepository: CollectionRepository) {}

  public async execute(payload: FindCollectionsQueryHandlerPayload): Promise<FindCollectionsQueryHandlerResult> {
    const { userId, page, pageSize, sortDate } = payload;

    let findCollectionsPayload: FindCollectionsPayload = {
      userId,
      page,
      pageSize,
    };

    if (sortDate) {
      findCollectionsPayload = {
        ...findCollectionsPayload,
        sortDate,
      };
    }

    const [collections, total] = await Promise.all([
      this.collectionRepository.findCollections(findCollectionsPayload),
      this.collectionRepository.countCollections({ userId }),
    ]);

    return {
      collections,
      total,
    };
  }
}
