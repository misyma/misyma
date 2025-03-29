import {
  type AuthorRepository,
  type FindAuthorsPayload,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

import { type ExecutePayload, type ExecuteResult, type FindAuthorsQueryHandler } from './findAuthorsQueryHandler.js';

export class FindAuthorsQueryHandlerImpl implements FindAuthorsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { ids, name, isApproved, userId, bookshelfId, page, pageSize, sortField, sortOrder } = payload;

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

    if (ids !== undefined) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        ids,
      };
    }

    if (sortField && sortOrder) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        sortField,
        sortOrder,
      };
    }

    if (userId) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        userId,
      };
    }

    if (isApproved !== undefined) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        isApproved,
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
