import { type ExecutePayload, type ExecuteResult, type FindAuthorsQueryHandler } from './findAuthorsQueryHandler.js';
import {
  type FindAuthorsPayload,
  type AuthorRepository,
} from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorsQueryHandlerImpl implements FindAuthorsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { name } = payload;

    let findAuthorsPayload: FindAuthorsPayload = {};

    if (name) {
      findAuthorsPayload = {
        ...findAuthorsPayload,
        partialName: name,
        isApproved: true,
      };
    }

    const authors = await this.authorRepository.findAuthors(findAuthorsPayload);

    return { authors };
  }
}
