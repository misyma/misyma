import {
  type FindBookChangeRequestsQueryHandlerPayload,
  type FindBookChangeRequestsQueryHandler,
  type FindBookChangeRequestsQueryHandlerResult,
} from './findBookChangeRequestsQueryHandler.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';

export class FindBookChangeRequestsQueryHandlerImpl implements FindBookChangeRequestsQueryHandler {
  public constructor(private readonly bookChangeRequestRepository: BookChangeRequestRepository) {}

  public async execute(
    payload: FindBookChangeRequestsQueryHandlerPayload,
  ): Promise<FindBookChangeRequestsQueryHandlerResult> {
    const { page, pageSize } = payload;

    const [bookChangeRequests, total] = await Promise.all([
      this.bookChangeRequestRepository.findBookChangeRequests({
        page,
        pageSize,
      }),
      this.bookChangeRequestRepository.countBookChangeRequests(),
    ]);

    return {
      bookChangeRequests,
      total,
    };
  }
}
