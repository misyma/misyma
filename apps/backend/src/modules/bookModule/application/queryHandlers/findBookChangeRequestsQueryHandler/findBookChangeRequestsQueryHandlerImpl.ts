import {
  type FindBookChangeRequestsQueryHandlerPayload,
  type FindBookChangeRequestsQueryHandler,
  type FindBookChangeRequestsQueryHandlerResult,
} from './findBookChangeRequestsQueryHandler.js';
import {
  type FindBookChangeRequestsPayload,
  type BookChangeRequestRepository,
} from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';

export class FindBookChangeRequestsQueryHandlerImpl implements FindBookChangeRequestsQueryHandler {
  public constructor(private readonly bookChangeRequestRepository: BookChangeRequestRepository) {}

  public async execute(
    payload: FindBookChangeRequestsQueryHandlerPayload,
  ): Promise<FindBookChangeRequestsQueryHandlerResult> {
    const { page, pageSize, userId } = payload;

    let findBookChangeRequestsPayload: FindBookChangeRequestsPayload = {
      page,
      pageSize,
    };

    if (userId) {
      findBookChangeRequestsPayload = {
        ...findBookChangeRequestsPayload,
        userId,
      };
    }

    const [bookChangeRequests, total] = await Promise.all([
      this.bookChangeRequestRepository.findBookChangeRequests(findBookChangeRequestsPayload),
      this.bookChangeRequestRepository.countBookChangeRequests(findBookChangeRequestsPayload),
    ]);

    return {
      bookChangeRequests,
      total,
    };
  }
}
