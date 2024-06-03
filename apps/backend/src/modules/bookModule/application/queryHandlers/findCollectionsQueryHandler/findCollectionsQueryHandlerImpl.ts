import {
  type FindCollectionsPayload,
  type FindCollectionsQueryHandler,
  type FindCollectionsResult,
} from './findCollectionsQueryHandler.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';

export class FindCollectionsQueryHandlerImpl implements FindCollectionsQueryHandler {
  public constructor(private readonly collectionRepository: CollectionRepository) {}

  public async execute(payload: FindCollectionsPayload): Promise<FindCollectionsResult> {
    const { userId, page, pageSize } = payload;

    const findCollectionsPayload = {
      userId,
      page,
      pageSize,
    };

    const [collections, total] = await Promise.all([
      this.collectionRepository.findCollections(findCollectionsPayload),
      this.collectionRepository.countCollections(findCollectionsPayload),
    ]);

    return {
      collections,
      total,
    };
  }
}
