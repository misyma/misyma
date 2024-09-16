import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';
import { type Author } from '../../entities/author/author.js';

export interface CreateAuthorPayload {
  readonly name: string;
}

export interface FindAuthorPayload {
  readonly id?: string;
  readonly name?: string;
}

export class AuthorRepository {
  private readonly authorsTable = 'authors';

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
  ) {}

  public async create(entity: CreateAuthorPayload): Promise<Author> {
    const { name } = entity;

    try {
      const result = await this.databaseClient<Author>(this.authorsTable).insert(
        {
          id: this.uuidService.generateUuid(),
          name,
          isApproved: true,
          createdAt: new Date(),
        },
        '*',
      );

      return result[0] as Author;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'create',
        name,
        error,
      });
    }
  }

  public async findAuthor(payload: FindAuthorPayload): Promise<Author | null> {
    const { id, name } = payload;

    let whereCondition: Partial<Author> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (name) {
      whereCondition = {
        ...whereCondition,
        name,
      };
    }

    let author: Author | undefined;

    try {
      author = await this.databaseClient<Author>(this.authorsTable).select('*').where(whereCondition).first();

      return author ?? null;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Author',
        operation: 'find',
        id,
        name,
        error,
      });
    }
  }
}
