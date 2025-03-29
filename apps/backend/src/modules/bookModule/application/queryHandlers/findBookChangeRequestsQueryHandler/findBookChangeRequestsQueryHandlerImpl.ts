import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import {
  type FindBookChangeRequestsPayload,
  type BookChangeRequestRepository,
} from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';

import {
  type FindBookChangeRequestsQueryHandlerPayload,
  type FindBookChangeRequestsQueryHandler,
  type FindBookChangeRequestsQueryHandlerResult,
} from './findBookChangeRequestsQueryHandler.js';

export class FindBookChangeRequestsQueryHandlerImpl implements FindBookChangeRequestsQueryHandler {
  public constructor(
    private readonly bookChangeRequestRepository: BookChangeRequestRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(
    payload: FindBookChangeRequestsQueryHandlerPayload,
  ): Promise<FindBookChangeRequestsQueryHandlerResult> {
    const { userId, id, page, pageSize, sortDate } = payload;

    let findBookChangeRequestsPayload: FindBookChangeRequestsPayload = {
      page,
      pageSize,
      sortDate,
    };

    if (userId) {
      const user = await this.userRepository.findUser({ id: userId });

      if (!user) {
        throw new ResourceNotFoundError({
          resource: 'User',
          id: userId,
        });
      }

      findBookChangeRequestsPayload = {
        ...findBookChangeRequestsPayload,
        userEmail: user.getEmail(),
      };
    }

    if (id) {
      findBookChangeRequestsPayload = {
        ...findBookChangeRequestsPayload,
        id,
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
