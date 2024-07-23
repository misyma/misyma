import { type BookFormat, type Language } from '@common/contracts';

import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookChangeRequestRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import { bookChangeRequestTable } from '../../../infrastructure/databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestTable.js';
import { BookChangeRequestTestFactory } from '../../factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookChangeRequestRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookChangeRequestTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, bookChangeRequestTable);
  }

  private readonly bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookChangeRequestRawEntity> {
    const { input } = payload;

    const bookChangeRequest = this.bookChangeRequestTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).insert(
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

    const rawEntity = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable)
      .where({ id })
      .first();

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
}
