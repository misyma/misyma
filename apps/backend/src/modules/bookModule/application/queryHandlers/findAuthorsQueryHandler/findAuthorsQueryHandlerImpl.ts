import { type ExecutePayload, type ExecuteResult, type FindAuthorsQueryHandler } from './findAuthorsQueryHandler.js';
import {
  type AuthorRepository,
  type FindAuthorsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorsQueryHandlerImpl implements FindAuthorsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { ids, name, userId, bookshelfId, page, pageSize, sortDate } = payload;

    let findAuthorsPayload: FindAuthorsPayload = {
      page,
      pageSize,
    };

    if (name) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        name,
      };
    }

    if (ids) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        ids,
      };
    }

    if (sortDate) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        sortDate,
      };
    }

    if (userId) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        userId,
      };
    }

    if (bookshelfId) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        bookshelfId,
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
