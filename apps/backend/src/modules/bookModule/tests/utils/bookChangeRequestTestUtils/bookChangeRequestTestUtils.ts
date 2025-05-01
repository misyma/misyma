import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookChangeRequestRawEntity } from '../../../../databaseModule/infrastructure/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import { booksChangeRequestsTable } from '../../../../databaseModule/infrastructure/tables/bookChangeRequestTable/bookChangeRequestTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BookChangeRequestTestFactory } from '../../factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookChangeRequestRawEntity> & { readonly bookId: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookChangeRequestTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, booksChangeRequestsTable);
  }

  private readonly bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<BookChangeRequestRawEntity> {
    const { input } = payload;

    const bookChangeRequest = this.bookChangeRequestTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable).insert(
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
        changedFields: bookChangeRequest.changedFields,
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookChangeRequestRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookChangeRequestRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable)
      .where({ id })
      .first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
