import { type FindUsersQueryHandler, type ExecutePayload, type ExecuteResult } from './findUsersQueryHandler.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUsersQueryHandlerImpl implements FindUsersQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { page, pageSize } = payload;

    const [users, total] = await Promise.all([
      this.userRepository.findUsers({
        page,
        pageSize,
      }),
      this.userRepository.countUsers(),
    ]);

    return {
      users,
      total,
    };
  }
}
