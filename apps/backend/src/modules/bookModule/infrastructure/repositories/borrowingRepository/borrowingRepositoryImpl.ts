import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BorrowingRawEntity } from '../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingRawEntity.js';
import { borrowingsTable } from '../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { Borrowing, type BorrowingState } from '../../../domain/entities/borrowing/borrowing.js';
import {
  type BorrowingRepository,
  type DeletePayload,
  type FindBorrowingPayload,
  type FindBorrowingsPayload,
  type SavePayload,
} from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';

import { type BorrowingMapper } from './borrowingMapper/borrowingMapper.js';

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
      rawEntity = await this.databaseClient<BorrowingRawEntity>(borrowingsTable).where({ id }).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.borrowingMapper.mapToDomain(rawEntity);
  }

  public async findBorrowings(payload: FindBorrowingsPayload): Promise<Borrowing[]> {
    const { userBookId, page, pageSize, sortDate, isOpen } = payload;

    let rawEntities: BorrowingRawEntity[];

    try {
      const query = this.databaseClient<BorrowingRawEntity>(borrowingsTable)
        .where({ user_book_id: userBookId })
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (sortDate) {
        query.orderBy('started_at', sortDate);
      }

      if (isOpen !== undefined) {
        if (isOpen) {
          query.whereNull('ended_at');
        } else {
          query.whereNotNull('ended_at');
        }
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.borrowingMapper.mapToDomain(rawEntity));
  }

  private async create(entity: CreateBorrowingPayload): Promise<Borrowing> {
    const { borrowing } = entity;

    let rawEntity: BorrowingRawEntity;

    try {
      const result = await this.databaseClient<BorrowingRawEntity>(borrowingsTable).insert(
        {
          id: this.uuidService.generateUuid(),
          user_book_id: borrowing.userBookId,
          borrower: borrowing.borrower,
          started_at: borrowing.startedAt,
          ended_at: borrowing.endedAt,
        },
        '*',
      );

      rawEntity = result[0] as BorrowingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'create',
        originalError: error,
      });
    }

    return this.borrowingMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBorrowingPayload): Promise<Borrowing> {
    const { borrowing } = payload;

    let rawEntity: BorrowingRawEntity;

    try {
      const { borrower, startedAt, endedAt } = borrowing.getState();
      const result = await this.databaseClient<BorrowingRawEntity>(borrowingsTable)
        .where({ id: borrowing.getId() })
        .update({ borrower, started_at: startedAt, ended_at: endedAt }, '*');

      rawEntity = result[0] as BorrowingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'update',
        originalError: error,
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
      await this.databaseClient<BorrowingRawEntity>(borrowingsTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Borrowing',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countBorrowings(payload: FindBorrowingsPayload): Promise<number> {
    const { userBookId } = payload;

    try {
      const countResult = await this.databaseClient<BorrowingRawEntity>(borrowingsTable)
        .where({ user_book_id: userBookId })
        .count()
        .first();

      const count = countResult?.['count'];

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
        originalError: error,
      });
    }
  }
}
