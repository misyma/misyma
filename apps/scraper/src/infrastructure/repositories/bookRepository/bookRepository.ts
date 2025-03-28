import { type BookFormat, type Language } from '@common/contracts';

import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';
import { type Book } from '../../entities/book/book.js';

export interface CreateBookPayload {
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined;
  readonly authorIds: string[];
}

export interface UpdateBookPayload {
  readonly id: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
}

export interface FindBookPayload {
  readonly isbn?: string;
  readonly title?: string;
}

export class BookRepository {
  private readonly bookTable = 'books';
  private readonly bookAuthorTable = 'booksAuthors';

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
  ) {}

  public async createBook(payload: CreateBookPayload): Promise<void> {
    const {
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      isApproved,
      imageUrl,
      authorIds,
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<Book>(this.bookTable).insert({
          id,
          title,
          isbn,
          publisher,
          releaseYear,
          language,
          translator,
          format,
          pages,
          isApproved,
          imageUrl,
          createdAt: new Date(),
        });

        await transaction.batchInsert(
          this.bookAuthorTable,
          authorIds.map((authorId) => ({
            bookId: id,
            authorId,
          })),
        );
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'create',
        error,
      });
    }
  }

  public async findBook(payload: FindBookPayload): Promise<Book | null> {
    const { isbn, title } = payload;

    try {
      let whereClause: Partial<Book> = {};

      if (isbn) {
        whereClause = {
          ...whereClause,
          isbn,
        };
      }

      if (title) {
        whereClause = {
          ...whereClause,
          title,
        };
      }

      const book = await this.databaseClient<Book>(this.bookTable).select('*').where(whereClause).first();

      if (!book) {
        return null;
      }

      return book;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'find',
        error,
      });
    }
  }
}
