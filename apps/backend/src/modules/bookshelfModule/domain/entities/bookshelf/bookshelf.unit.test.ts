import { describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { BookshelfDomainActionType } from './bookshelfDomainActions/bookshelfDomainActionType.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { BookshelfTestFactory } from '../../../tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';

describe('Bookshelf', () => {
  const bookshelfTestFactory = BookshelfTestFactory.createFactory();

  const bookshelf = bookshelfTestFactory.create();

  describe('addUpdateNameDomainAction', () => {
    it('throws an error - when updating Bookshelf name with the same name', () => {
      const name = bookshelf.getName();

      expect(() => {
        bookshelf.addUpdateNameDomainAction({
          name,
        });
      }).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          reason: 'Bookshelf name is already the same.',
          name,
        },
      });
    });

    it('adds a domain action - when updating Bookshelf name', () => {
      const newName = Generator.alphaString(20);

      const result = bookshelf.addUpdateNameDomainAction({
        name: newName,
      });

      const domainActions = result.getDomainActions();

      expect(domainActions.length).toEqual(1);

      expect(domainActions[0]).toEqual({
        actionName: BookshelfDomainActionType.updateName,
        payload: {
          name: newName,
        },
      });
    });
  });

  describe('addUpdateAddressIdDomainAction', () => {
    it('throws an error - when updating Bookshelf addressId with the same addressId', () => {
      const addressId = bookshelf.getAddressId();

      expect(() => {
        bookshelf.addUpdateAddressIdDomainAction({
          addressId,
        });
      }).toThrowErrorInstance({
        instance: OperationNotValidError,
        context: {
          reason: 'Bookshelf addressId is already the same.',
          addressId,
        },
      });
    });

    it('adds a domain action - when updating Bookshelf addressId', () => {
      const newAddressId = Generator.uuid();

      const bookshelf = bookshelfTestFactory.create();

      const result = bookshelf.addUpdateAddressIdDomainAction({
        addressId: newAddressId,
      });

      const domainActions = result.getDomainActions();

      expect(domainActions.length).toEqual(1);

      expect(domainActions[0]).toEqual({
        actionName: BookshelfDomainActionType.updateAddressId,
        payload: {
          addressId: newAddressId,
        },
      });
    });
  });
});
