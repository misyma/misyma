import { type BookFormat, type Language } from '@common/contracts';

import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookChangeRequestRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import { quoteTable } from '../../../infrastructure/databases/bookDatabase/tables/quoteTable/quoteTable.js';
import { BookChangeRequestTestFactory } from '../../factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookChangeRequestRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookChangeRequestTestUtils implements TestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookChangeRequestRawEntity> {
    const { input } = payload;

    const bookChangeRequest = this.bookChangeRequestTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(quoteTable).insert(
      {
        id: bookChangeRequest.getId(),
        title: bookChangeRequest.getTitle() as string,
        isbn: bookChangeRequest.getIsbn() as string,
        publisher: bookChangeRequest.getPublisher() as string,
        releaseYear: bookChangeRequest.getReleaseYear() as number,
        language: bookChangeRequest.getLanguage() as Language,
        translator: bookChangeRequest.getTranslator() as string,
        format: bookChangeRequest.getFormat() as BookFormat,
        pages: bookChangeRequest.getPages() as number,
        imageUrl: bookChangeRequest.getImageUrl() as string,
        bookId: bookChangeRequest.getBookId(),
        userId: bookChangeRequest.getUserId(),
        createdAt: bookChangeRequest.getCreatedAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookChangeRequestRawEntity;

    return {
      id: rawEntity.id,
      title: rawEntity.title,
      isbn: rawEntity.isbn,
      publisher: rawEntity.publisher,
      releaseYear: rawEntity.releaseYear,
      language: rawEntity.language,
      translator: rawEntity.translator,
      format: rawEntity.format,
      pages: rawEntity.pages,
      imageUrl: rawEntity.imageUrl,
      bookId: rawEntity.bookId,
      userId: rawEntity.userId,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async findById(payload: FindByIdPayload): Promise<BookChangeRequestRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookChangeRequestRawEntity>(quoteTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return {
      id: rawEntity.id,
      title: rawEntity.title,
      isbn: rawEntity.isbn,
      publisher: rawEntity.publisher,
      releaseYear: rawEntity.releaseYear,
      language: rawEntity.language,
      translator: rawEntity.translator,
      format: rawEntity.format,
      pages: rawEntity.pages,
      imageUrl: rawEntity.imageUrl,
      bookId: rawEntity.bookId,
      userId: rawEntity.userId,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient(quoteTable).truncate();
  }
}
