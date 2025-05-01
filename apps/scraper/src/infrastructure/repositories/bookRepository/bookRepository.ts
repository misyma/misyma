import { type BookFormat, type Language } from '@common/contracts';

import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';
import { type Book } from '../../entities/book/book.js';
import { type BookAuthor } from '../../entities/bookAuthor/bookAuthor.js';

export interface CreateBookPayload {
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly release_year?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly is_approved: boolean;
  readonly image_url?: string | undefined;
  readonly author_ids: string[];
  readonly category_id: string;
}

export interface FindBookPayload {
  readonly isbn?: string;
  readonly title?: string;
}

export class BookRepository {
  private readonly bookTable = 'books';
  private readonly bookAuthorTable = 'books_authors';

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
  ) {}

  public async createBook(payload: CreateBookPayload): Promise<void> {
    const {
      title,
      isbn,
      publisher,
      release_year,
      language,
      translator,
      format,
      pages,
      is_approved,
      image_url,
      author_ids,
      category_id,
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient.transaction(async (transaction) => {
        await transaction<Book>(this.bookTable).insert({
          id,
          title,
          isbn,
          publisher,
          release_year,
          language,
          translator,
          format,
          pages,
          is_approved,
          image_url,
          category_id,
        });

        await transaction.batchInsert<BookAuthor>(
          this.bookAuthorTable,
          author_ids.map((author_id) => ({
            book_id: id,
            author_id,
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
