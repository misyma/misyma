import { type BookshelfDomainAction } from './bookshelfDomainActions/bookshelfDomainAction.js';
import { BookshelfDomainActionType } from './bookshelfDomainActions/bookshelfDomainActionType.js';
import { OperationNotValidError } from '../../../../../../common/errors/common/operationNotValidError.js';

export interface BookshelfState {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly addressId?: string | undefined;
}

export interface AddUpdateNameDomainActionPayload {
  name: string;
}

export interface AddUpdateAddressIdDomainActionPayload {
  addressId: string | undefined;
}

export class Bookshelf {
  private readonly state: BookshelfState;

  private readonly actions: BookshelfDomainAction[] = [];

  public constructor(state: BookshelfState) {
    this.state = state;
  }

  public getState(): BookshelfState {
    return { ...this.state };
  }

  public getDomainActions(): BookshelfDomainAction[] {
    return [...this.actions];
  }

  public addUpdateNameDomainAction(payload: AddUpdateNameDomainActionPayload): Bookshelf {
    const { name } = payload;

    if (this.getName() === name) {
      throw new OperationNotValidError({
        reason: 'Bookshelf name is already the same.',
        name,
      });
    }

    this.actions.push({
      actionName: BookshelfDomainActionType.updateName,
      payload: {
        name,
      },
    });

    return this;
  }

  public addUpdateAddressIdDomainAction(payload: AddUpdateAddressIdDomainActionPayload): Bookshelf {
    const { addressId } = payload;

    if (this.getAddressId() === addressId) {
      throw new OperationNotValidError({
        reason: 'Bookshelf addressId is already the same.',
        addressId,
      });
    }

    this.actions.push({
      actionName: BookshelfDomainActionType.updateAddressId,
      payload: {
        addressId,
      },
    });

    return this;
  }

  public getId(): string {
    return this.state.id;
  }

  public getName(): string {
    return this.state.name;
  }

  public getUserId(): string {
    return this.state.userId;
  }

  public getAddressId(): string | undefined {
    return this.state.addressId;
  }
}
