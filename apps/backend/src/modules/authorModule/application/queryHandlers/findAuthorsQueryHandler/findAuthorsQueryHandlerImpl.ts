import { type ExecutePayload, type ExecuteResult, type FindAuthorsQueryHandler } from './findAuthorsQueryHandler.js';
import {
  type FindAuthorsPayload,
  type AuthorRepository,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorsQueryHandlerImpl implements FindAuthorsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { name, page, pageSize } = payload;

    let findAuthorsPayload: FindAuthorsPayload = {
      page,
      pageSize,
    };

    if (name) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        name,
        isApproved: true,
      };
    }

    const [authors, total] = await Promise.all([
      this.authorRepository.findAuthors(findAuthorsPayload),
      this.authorRepository.countAuthors(findAuthorsPayload),
    ]);

    return {
      authors,
      total,
    };
  }
}
