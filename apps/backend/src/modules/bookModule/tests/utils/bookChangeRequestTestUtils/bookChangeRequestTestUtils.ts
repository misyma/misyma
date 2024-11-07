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

    const bookChangeRequest = this.bookChangeRequestTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).insert(
      {
        id: bookChangeRequest.id,
        title: bookChangeRequest.title,
        isbn: bookChangeRequest.isbn,
        publisher: bookChangeRequest.publisher,
        releaseYear: bookChangeRequest.releaseYear,
        language: bookChangeRequest.language,
        translator: bookChangeRequest.translator,
        format: bookChangeRequest.format,
        pages: bookChangeRequest.pages,
        imageUrl: bookChangeRequest.imageUrl,
        bookId: bookChangeRequest.bookId,
        userEmail: bookChangeRequest.userEmail,
        createdAt: bookChangeRequest.createdAt,
        authorIds: bookChangeRequest.authorIds,
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookChangeRequestRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookChangeRequestRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable)
      .where({ id })
      .first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
