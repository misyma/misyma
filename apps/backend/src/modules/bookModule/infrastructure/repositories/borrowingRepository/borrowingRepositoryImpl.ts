import { type BorrowingMapper } from './borrowingMapper/borrowingMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { Borrowing, type BorrowingState } from '../../../domain/entities/borrowing/borrowing.js';
import {
  type BorrowingRepository,
  type DeletePayload,
  type FindBorrowingPayload,
  type FindBorrowingsPayload,
  type SavePayload,
} from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type BorrowingRawEntity } from '../../databases/bookDatabase/tables/borrowingTable/borrowingRawEntity.js';
import { borrowingTable } from '../../databases/bookDatabase/tables/borrowingTable/borrowingTable.js';

type CreateBorrowingPayload = { borrowing: BorrowingState };

type UpdateBorrowingPayload = { borrowing: Borrowing };

export class BorrowingRepositoryImpl implements BorrowingRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly borrowingMapper: BorrowingMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findBorrowing(payload: FindBorrowingPayload): Promise<Borrowing | null> {
    const { id } = payload;

    let rawEntity: BorrowingRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<BorrowingRawEntity>(borrowingTable).where({ id }).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.borrowingMapper.mapToDomain(rawEntity);
  }

  public async findBorrowings(payload: FindBorrowingsPayload): Promise<Borrowing[]> {
    const { userBookId, page, pageSize, sortDate } = payload;

    let rawEntities: BorrowingRawEntity[];

    try {
      const query = this.databaseClient<BorrowingRawEntity>(borrowingTable)
        .where({ userBookId })
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (sortDate) {
        query.orderBy('startedAt', sortDate);
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.borrowingMapper.mapToDomain(rawEntity));
  }

  private async create(entity: CreateBorrowingPayload): Promise<Borrowing> {
    const { borrowing } = entity;

    let rawEntity: BorrowingRawEntity;

    try {
      const result = await this.databaseClient<BorrowingRawEntity>(borrowingTable).insert(
        {
          id: this.uuidService.generateUuid(),
          userBookId: borrowing.userBookId,
          borrower: borrowing.borrower,
          startedAt: borrowing.startedAt,
          endedAt: borrowing.endedAt,
        },
        '*',
      );

      rawEntity = result[0] as BorrowingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'create',
        error,
      });
    }

    return this.borrowingMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBorrowingPayload): Promise<Borrowing> {
    const { borrowing } = payload;

    let rawEntity: BorrowingRawEntity;

    try {
      const result = await this.databaseClient<BorrowingRawEntity>(borrowingTable)
        .where({ id: borrowing.getId() })
        .update(borrowing.getState(), '*');

      rawEntity = result[0] as BorrowingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'update',
        error,
      });
    }

    return this.borrowingMapper.mapToDomain(rawEntity);
  }

  public async saveBorrowing(payload: SavePayload): Promise<Borrowing> {
    const { borrowing } = payload;

    if (borrowing instanceof Borrowing) {
      return this.update({ borrowing });
    }

    return this.create({ borrowing });
  }

  public async deleteBorrowing(payload: DeletePayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BorrowingRawEntity>(borrowingTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'delete',
        error,
      });
    }
  }

  public async countBorrowings(payload: FindBorrowingsPayload): Promise<number> {
    const { userBookId } = payload;

    try {
      const countResult = await this.databaseClient<BorrowingRawEntity>(borrowingTable)
        .where({ userBookId })
        .count()
        .first();

      const count = countResult?.['count(*)'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Borrowing',
          operation: 'count',
          countResult,
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'count',
        error,
      });
    }
  }
}
